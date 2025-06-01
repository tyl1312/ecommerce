import User from '../models/User.js';
import Progress from '../models/Progress.js';
import jwt from 'jsonwebtoken';
import { sendToken } from '../middlewares/auth/sendToken.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { sendMail } from '../helper/sendMail.js';
import validator from 'validator';
import { SuccessResponse, Created } from '../core/success.response.js';
import { BadRequest, NotFound, Unauthorized, Forbidden, InternalServerError } from '../core/error.response.js';
import { handleErrorResponse } from '../helper/handleErrorResponse.js';

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save();
        return { accessToken, refreshToken };
    } catch (error) {
        return new InternalServerError({ message: 'Something went wrong while generating refresh and access token' }).send(res);
    } 
};

const userController = {
    // Method: POST
    // Path: /user/register
    register: async (req, res) => {
        try {
            const { username, email, password, confirmPassword } = req.body;
            const recaptchaResponse = req.body['g-recaptcha-response'];

            if (recaptchaResponse) {
                try {
                    const recaptchaVerifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaResponse}`;
                    const recaptchaVerifyResponse = await fetch(recaptchaVerifyUrl, { method: 'POST' });
                    const recaptchaVerifyData = await recaptchaVerifyResponse.json();
                    if (!recaptchaVerifyData.success) {
                        throw new BadRequest({ message: 'reCAPTCHA verification failed', req }, 'info');
                    }

                    continueRegister();

                } catch (error) {
                    return handleErrorResponse(error, req, res);
                }
            } else {
                throw new BadRequest({ message: 'reCAPTCHA verification failed', req }, 'info');
            }
            await continueRegister();

            async function continueRegister() {
                try {
                    if (!username || !email || !password || !confirmPassword) {
                        throw new BadRequest({ message: 'All fields are required', req }, 'info');
                    }
    
                    // check if username has invalid characters
                    if (!/^[a-zA-Z0-9]+$/.test(username)) {
                        throw new BadRequest({ message: 'Username is invalid, only contain a-z, A-Z, 0-9', req }, 'info');
                    }
    
                    if (username.length < 3) {
                        throw new BadRequest({ message: 'Username must be at least 3 characters', req }, 'info');
                    }
                    
                    // check if email is valid
                    if (!validator.isEmail(email)) {
                        throw new BadRequest({ message: 'Invalid email', req }, 'info');
                    }

                    // check if user already exists
                    const existingUser = await User.findOne({ username });
                    if (existingUser) {
                        throw new BadRequest({ message: 'Username already exists', req }, 'info');
                    }
    
                    const existingEmail = await User.findOne({ email });
                    if (existingEmail) {
                        throw new BadRequest({ message: 'Email already exists', req }, 'info');
                    }
    
                    if (!validator.isStrongPassword(password)){
                        throw new BadRequest({ message: 'Password is too weak', req }, 'info');
                    }
    
                    if (password !== confirmPassword) {
                        throw new BadRequest({ message: 'Password does not match', req }, 'info');
                    }
    
                    let verificationToken = crypto.randomBytes(32).toString('hex');
                    const newUser = new User({ username, email, password, verifyToken: verificationToken });
                    await newUser.save();

                    // Create a progress document for the new user
                    await Progress.create({
                        user: newUser._id,
                        completedQuizzes: [],
                        totalScore: 0,
                        totalCompletedQuizzes: 0,
                    })

                    res.cookie('verificationToken', verificationToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 1000 * 60 * 30 }); 
    
                    // send verification email
                    const verificationUrl = `${process.env.SERVER_URL}/user/verify-email/${verificationToken}`;
                    const html = `<p>Please click <a href="${verificationUrl}">here</a> to verify your email address.</p>`;
                    await sendMail(email, 'Verify your email address', html);
    
                    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(newUser._id);
                    
                    new Created({ message: 'Registered Successfully', req });
                    // send token
                    sendToken(res, newUser, accessToken, refreshToken, "Registered Successfully", 201);
                } catch (error) {
                    return handleErrorResponse(error, req, res);
                }
            }
        }
        catch (error) {
            return handleErrorResponse(error, req, res);
        }
    },

    // Method: POST
    // Path: /user/login
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            const recaptchaResponse = req.body['g-recaptcha-response'];

            if (recaptchaResponse) {
                try {
                    const recaptchaVerifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaResponse}`;
                    const recaptchaVerifyResponse = await fetch(recaptchaVerifyUrl, { method: 'POST' });
                    const recaptchaVerifyData = await recaptchaVerifyResponse.json();

                    if (!recaptchaVerifyData.success) {
                        throw new BadRequest({ message: 'reCAPTCHA verification failed', req }, 'info');
                    }

                    continueLogin();
                } catch (error) {
                    return handleErrorResponse(error, req, res);
                }
            } else {
                continueLogin();
            }
            await continueLogin();

            async function continueLogin() {
                try {
                    if (!email || !password) {
                        throw new BadRequest({ message: 'All fields are required', req }, 'info');
                    }

                    // check if email is valid
                    if (!validator.isEmail(email)) {
                        throw new BadRequest({ message: 'Invalid email', req }, 'info');
                    }
        
                    const user = await User.findOne({ email }).select('-refreshToken -passwordHistory -resetPasswordToken -resetPasswordExpires -verifyToken');
                    if (!user) {
                        throw new Unauthorized({ message: 'Incorrect Email or Password', req }, 'info');
                    }
        
                    if (user.loginAttempts >= 5 && !recaptchaResponse) {
                        throw new Unauthorized({ message: 'Please complete the reCAPTCHA', req }, 'info');
                    }
        
                    const isMatch = await user.isCorrectPassword(password);
                    if (!isMatch) {
                        user.loginAttempts += 1;
                        await user.save();
                        throw new Unauthorized({ message: 'Incorrect Email or Password', req }, 'info');
                    }
        
                    user.loginAttempts = 0;
                    await user.save();
        
                    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user.id);
                    user.loginAttempts = undefined;
                    user.password = undefined;
    
                    new SuccessResponse({ message: `Welcome back, ${user.username}`, req });
                    sendToken(res, user, accessToken, refreshToken, `Welcome back, ${user.username}`, 200);    
                } catch (error) {
                    return handleErrorResponse(error, req, res);
                }
            }
        } catch (error) {
            return handleErrorResponse(error, req, res);
        }
    },

    // Method: POST
    // Path: /user/logout
    logout: async (req, res) => {
        try {

            await User.findByIdAndUpdate(req.user.id, { refreshToken: '' });
            const option = {
                httpOnly: true,
                secure: true,
                sameSite: "None",
            };
    
            new SuccessResponse({ message: 'Logged Out Successfully', req });

            // clear cookies
            res
            .status(200)
            .clearCookie("accessToken", option)
            .clearCookie("refreshToken", option)
            .clearCookie("csrfSecret", option)
            .json({
                success: true,
                message: "Logged Out Successfully",
            });
        } catch (error) {
            return new InternalServerError({ message: error.message, req }).send(res);
        }   
    },

    // Method: GET
    // Path: /user
    getUserReference: async (req, res) => {
        try {
            const users = await User.find().select('-password -refreshToken -verifyToken -passwordHistory -resetPasswordToken -resetPasswordExpires');
            if (!users || users.length === 0) {
                throw new NotFound({ message: 'No users found', req }, 'info');
            }
    
            // Pagination
            const page = parseInt(req.query.page) || 1;
            const perPage = parseInt(req.query.perPage) || 10;
            const startIndex = (page - 1) * perPage;
            const endIndex = page * perPage;
            const total = users.length;
    
            // Create data for the current page
            const data = users.slice(startIndex, endIndex);
            new SuccessResponse({ message: 'Users retrieved successfully', req });
            return res.status(200).json({ items: data, page, perPage, total });
        } catch (error) {
            return handleErrorResponse(error, req, res);
        }
    },

    // Method: GET
    // Path: /user/all
    getAllUsers: async (req, res) => {
        try {
            const users = await User.find().select('username email role experience createdAt');
            if (!users || users.length === 0) {
                throw new NotFound({ message: 'No users found', req }, 'info');
            }
    
            const total = users.length;
            return res.status(200).json({ items: users, total });
        } catch (error) {
            return handleErrorResponse(error, req, res);
        }
    },

    // Method: GET
    // Path: /user/:id
    getUserById: async (req, res) => {
        try {
            const userId = req.params.id;
            const user = await User.findById(userId).select('username email role experience createdAt isVerified -_id');
            if (!user) {
                throw new NotFound({ message: 'User not found', req }, 'info');
            }
            new SuccessResponse({ message: 'User retrieved successfully', req });
            return res.status(200).json(user);
        } catch (error) {
            return handleErrorResponse(error, req, res);
        }
    },

    // Method: GET
    // Path: /user/profile
    getProfile: async (req, res) => {
        try {
            const userId = req.user._id;
            const user = await User.findById(userId).select('username role experience createdAt');
            if (!user) {
                throw new NotFound({ message: 'User not found', req }, 'info');
            }
            new SuccessResponse({ message: 'Profile retrieved successfully', req });
            return res.status(200).json({ user });
        } catch (error) {
            return handleErrorResponse(error, req, res);
        }
    },

    // Method: GET
    // Path: /user/experience
    getExperienceAllUsers: async (req, res) => {
        try {
            const users = await User.find().select('username experience role -_id');
            if (!users || users.length === 0) {
                throw new NotFound({ message: 'No users found', req }, 'info');
            }

            const filterUsers = users.filter(user => user.role !== 'admin');
            const total = filterUsers.length;
            const items = filterUsers.map(user => {
                return { username: user.username, experience: user.experience };
            });
    
            return res.status(200).json({ items, total });
        } catch (error) {
            return handleErrorResponse(error, req, res);
        }
    },

    // Method: PUT
    // Path: /user/profile
    updateProfile: async (req, res) => {
        try {
            const userId = req.user._id;
            const { username, password } = req.body;
            const user = await User.findById(userId).select('username password role experience createdAt _id');
            
            if (!user){
                throw new NotFound({ message: 'User not found', req }, 'info');
            }
    
            // check if username has invalid characters
            if (username && !/^[a-zA-Z0-9]+$/.test(username)) {
                throw new BadRequest({ message: 'Username is invalid, only contain a-z, A-Z, 0-9', req }, 'info');
            }
    
            if (username && username.length < 3) {
                throw new BadRequest({ message: 'Username must be at least 3 characters', req }, 'info');
            }
    
            if (!password){
                throw new BadRequest({ message: 'Required password', req }, 'info');
            }
    
            const isMatch = await user.isCorrectPassword(password);
            if (!isMatch){
                throw new Unauthorized({ message: 'Incorrect old password', req }, 'info');
            }
    
            if (username){
                const existingUser = await User.findOne({ username: username });
                if (existingUser && existingUser._id.toString() !== userId){
                    throw new BadRequest({ message: 'Username already exists', req }, 'info');
                }
            }
    
            user.username = username;
            const updatedUser = await user.save();
            updatedUser.password = undefined;

            new SuccessResponse({ message: `Profile user ${userId} updated successfully`, req });
            return res.status(200).json( updatedUser );
        } catch (error) {
            return handleErrorResponse(error, req, res);
        }
    },

    // Method: GET
    // Path: /user/verify-email/:token
    verifyEmail: async (req, res) => {
        try {
            const token = req.params.token;
            if (!token) {
                new BadRequest({ message: 'Invalid or expired token', req });
                return res.redirect(`${process.env.CLIENT_URL}/verify-email/failed`);
            }
            const user = await User.findOne({ verifyToken: token });
            if (!user) {
                new NotFound({ message: 'Invalid or expired token', req });
                return res.redirect(`${process.env.CLIENT_URL}/verify-email/failed`);
            }
            user.isVerified = true;
            user.verifyToken = '';
            await user.save();
            res.clearCookie('verificationToken');
            new SuccessResponse({ message: 'Email verified successfully', req });
            return res.redirect(`${process.env.CLIENT_URL}/verify-email/success`);
            
        } catch (error) {
            return new InternalServerError({ message: error.message, req }).send(res);
        }
    },

    // Method: POST
    // Path: /user/resend-email
    resendEmail: async (req, res) => {
        try {
            const email = req.body.email;
            const user = await User.findOne({ email });
            if (!user) {
                throw new NotFound({ message: 'User not found', req }, 'info');
            }

            if (user.isVerified) {
                throw new BadRequest({ message: 'Email already verified', req }, 'info');
            }

            let verificationToken = crypto.randomBytes(32).toString('hex');
            user.verifyToken = verificationToken;
            await user.save();
            res.cookie('verificationToken', verificationToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 1000 * 60 * 60 * 2 });

            // send verification email
            const verificationUrl = `${process.env.SERVER_URL}/user/verify-email/${verificationToken}`;
            const html = `<p>Please click <a href="${verificationUrl}">here</a> to verify your email address.</p>`;
            console.log(html);
            await sendMail(email, 'Verify your email address', html);

            return new SuccessResponse({ message: 'Verification email sent successfully', req }).send(res);
        } catch (error) {
            return handleErrorResponse(error, req, res);
        }
    },

    // Method: PUT
    // Path: /user/change-password
    changePassword: async (req, res) => {

        try {
            const { oldPassword, newPassword, confirmPassword } = req.body;
            const userId = req.user._id;
            if (!oldPassword || !newPassword || !confirmPassword) {
                throw new BadRequest({ message: 'All fields are required', req }, 'info');
            }
    
            // check if old password is correct
            const user = await User.findById(userId);
            const isMatch = await user.isCorrectPassword(oldPassword);
            if (!isMatch) {
                throw new Unauthorized({ message: 'Incorrect old password', req }, 'info');
            }
    
            // check new password length
            if (!validator.isStrongPassword(newPassword)) {
                throw new BadRequest({ message: 'Password is too weak', req }, 'info');
            }
    
            // check confirm password
            if (newPassword !== confirmPassword) {
                throw new BadRequest({ message: 'Password does not match', req }, 'info');
            }

            // check new password is in the password history
            let isInPasswordHistory = false;
            for (const password of user.passwordHistory) {
                const isMatch = await bcrypt.compare(newPassword, password);
                if (isMatch) {
                    isInPasswordHistory = true;
                    break;
                }
            };

            if (isInPasswordHistory) {  
                throw new BadRequest({ message: 'Password has been used before', req }, 'info');
            }
            
            // update password
            user.password = newPassword;
            await user.save();
            
            new SuccessResponse({message: 'Password changed successfully', req}).send(res);
        } catch (error) {
            return handleErrorResponse(error, req, res);
        }
    },


    // Method: POST
    // Path: /user/forgot-password
    forgotPassword: async (req, res) => {
        try {
            const start = Date.now(); 
            const FORGOT_PASSWORD_RESPONSE_DELAY = 3000;

            const { email } = req.body;
            if (!email) {
                throw new BadRequest({ message: 'Email is required', req }, 'info');
            }
    
            const user = await User.findOne({ email });
            const token = user ? crypto.randomBytes(32).toString('hex') : null;
    
            if (user && user.isVerified) {
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 1000*60*20; // 20 minutes
                await user.save();
    
                const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
                const html = `<p>Please click <a href="${resetUrl}">here</a> to reset your password.</p>`;
                console.log(html);
                await sendMail(email, 'Reset your password', html);
            }
    
            // Calculate the time taken so far
            const timeTaken = Date.now() - start;
            const delay = Math.max(0, FORGOT_PASSWORD_RESPONSE_DELAY - timeTaken);

            // Add an artificial delay to equalize the response time
            setTimeout(() => {
                new SuccessResponse({ message: 'Reset link sent to your email', req }).send(res);
            }, delay);
    
        } catch (error) {
            return handleErrorResponse(error, req, res);
        }
    },

    // Method: POST
    // Path: /user/reset-password/:token
    resetPassword: async (req, res) => {
        try {
            const { password, confirmPassword } = req.body;
            const resetToken = req.params.token;
            if (!password || !confirmPassword) {
                throw new BadRequest({ message: 'All fields are required', req }, 'info');
            }
    
            if (password !== confirmPassword) {
                throw new BadRequest({ message: 'Password does not match', req }, 'info');
            }

            if (!validator.isStrongPassword(password)) {
                throw new BadRequest({ message: 'Password is too weak', req }, 'info');
            }
    
            const user = await User.findOne({
                resetPasswordToken: resetToken,
                resetPasswordExpires: { $gt: Date.now() }
            });
    
            if (!user) {
                throw new BadRequest({ message: 'Invalid or expired token', req }, 'info');
            }
    
            // check new password is in the password history
            let isInPasswordHistory = false;
            for (const oldPassword of user.passwordHistory) {
                const isMatch = await bcrypt.compare(password, oldPassword);
                if (isMatch) {
                    isInPasswordHistory = true;
                    break;
                }
            };
    
            if (isInPasswordHistory) {
                throw new BadRequest({ message: 'Password has been used before', req }, 'info');
            }

            // update password
            user.password = password;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();

            new SuccessResponse({ message: 'Password reset successfully', req }).send(res);    
        } catch (error) {
            return handleErrorResponse(error, req, res);
        }
    },

    // Method: POST
    // Path: /user/validate-reset-token
    validateResetToken: async (req, res) => {
        const { token } = req.body;
        try {
            const user = await User.findOne({
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: Date.now() }
            });
            if (!user) {
                throw new BadRequest({ message: 'Invalid or expired token', req }, 'info');
            }

            new SuccessResponse({ message: 'Token is valid', req }).send(res);
        } catch (error) {
            return handleErrorResponse(error, req, res);
        }
    },

    // Method: PUT
    // Path: /user/edit/:id
    adminEditUser: async (req, res) => {
        try {
            const userId = req.params.id;
            const { isVerified, experience } = req.body;
            const user = await User.findOneAndUpdate(
                { _id: userId }, 
                { $set: { isVerified, experience } }, 
                { new: true, select: 'username email role experience createdAt isVerified -_id' } 
            );
            
            if (!user) {
                throw new NotFound({ message: 'User not found', req }, 'info');
            }

            user.password = undefined;
            new SuccessResponse({ message: 'Admin updated user successfully', req }).send(res);
        } catch (error) {
           return handleErrorResponse(error, req, res);
        }
    },

    // Method: DELETE
    // Path: /user/users
    selfDeleteAccount: async (req, res) => {
        try {
            await User.findByIdAndDelete(req.user._id);
            new SuccessResponse({ message: 'Account deleted successfully', req }).send(res);
        } catch (error) {
            return new InternalServerError({ message: error.message, req }).send(res);
        }
    },

    // Method: DELETE
    // Path: /user/delete/:id
    adminDeleteAccount: async (req, res) => {
        try {
            const userId = req.params.id;
            const user = await User.findById(userId);
            if (user.role == 'admin') {
                return new Unauthorized({ message: 'You are not authorized to delete this account', req }).send(res);
            }

            await Promise.all([
                User.findByIdAndDelete(userId),
                Progress.deleteOne({ user: userId })
            ])
            new SuccessResponse({ message: 'Account deleted successfully', req }).send(res);
        } catch (error) {
            return new InternalServerError({ message: error.message, req }).send(res);
        }
    },

    // Method: DELETE
    // Path: /user/deleteMany
    adminDeleteManyAccount: async (req, res) => {
        try {
            const userIds = req.body.ids;
            const usersToDelete = await User.find({ _id: { $in: userIds } });
            const adminUsersToDelete = usersToDelete.filter(user => user.role === 'admin');
    
            // If an admin tries to delete an admin account
            if (adminUsersToDelete.length > 0) {
                return new Unauthorized({ message: 'Admin accounts cannot be deleted', req }).send(res);
            }

            await Promise.all([
                User.deleteMany({ _id: { $in: userIds } }),
                Progress.deleteMany({ user: { $in: userIds } })
            ]);
            new SuccessResponse({ message: 'Accounts deleted successfully', req }).send(res);
        } catch (error) {
            return handleErrorResponse(error, req, res);
        }
    },

    // Method: POST
    // Path: /user/refresh-token
    refreshToken: async (req, res) => {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                throw new Unauthorized({ message: 'User not authenticated', req }, 'info');
            }
    
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            const user = await User.findById(decoded._id);
            if (!user) {
                throw new NotFound({ message: 'User not found', req }, 'info');
            }
    
            if (user.refreshToken !== refreshToken) {
                throw new Forbidden({ message: 'Refresh token not valid', req });
            }
    
            const newAccessToken = await user.generateAccessToken();
            sendToken(res, user, newAccessToken, refreshToken, 'Token Refreshed Successfully', 200);
    
        } catch (error) {
            return handleErrorResponse(error, req, res);
        }
    },

    // Method: GET
    // Path: /user/check-login
    checkLogin: async (req, res) => {
        try {
            const token = req.cookies.accessToken;
            if (!token) {
               throw new Unauthorized({ message: 'User not authenticated', req }, 'info');
            }
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            const user = await User.findById(decoded._id).select('username email role isVerified experience createdAt -_id');
            if (!user) {
                throw new NotFound({ message: 'User not found', req }, 'info');
            }
            new SuccessResponse({ message: 'User is logged in', req });
            return res.status(200).json({ user });
        } catch (error) {
            return handleErrorResponse(error, req, res);
        }
    },
};

export default userController;

