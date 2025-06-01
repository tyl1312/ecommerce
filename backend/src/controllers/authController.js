const jwt = require('jsonwebtoken');
const axios = require('axios');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { generateOTP, sendOTP, storeOTP, verifyOTP } = require('../utils/otpUtils');
const crypto = require('crypto');

const failedLoginAttempts = new Map();
const pendingRegistrations = new Map();

const generateRegistrationId = () => {
    return crypto.randomBytes(32).toString('hex');
};

const cleanupExpiredRegistrations = () => {
    const now = Date.now();
    const fifteenMinutes = 15 * 60 * 1000; 
    
    for (const [id, data] of pendingRegistrations.entries()) {
        if (now - data.timestamp > fifteenMinutes) {
            pendingRegistrations.delete(id);
        }
    }
};

setInterval(cleanupExpiredRegistrations, 10 * 60 * 1000);

//Token generation functions
const generateAccessToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            username: user.username,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
    );
};

const generateRefreshToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            username: user.username,
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '1d' }
    );
};

//Refresh access token
const refresh = (req, res) => {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(403).json({ message: "Authentication required" });

    try {
        const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        const accessToken = generateAccessToken({
            _id: payload.id,
            email: payload.email,
            username: payload.username
        });
        res.json({ accessToken });
    } catch (err) {
        res.clearCookie('refreshToken');
        return res.status(401).json({ message: "Authentication required" });
    }
};

//Captcha verification function
const verifyCaptcha = async (captchaToken) => {
    const secret = process.env.RECAPTCHA_SECRET_KEY;
    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${captchaToken}`;
    try {
        const response = await axios.post(url);
        return response.data.success;
    } catch (err) {
        return false;
    }
};

// Failed attempts tracking functions
const getFailedAttempts = (clientIP, identifier) => {
    const key = `${clientIP}:${identifier}`;
    const attempts = failedLoginAttempts.get(key);
    if (!attempts) return 0;

    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    const recentAttempts = attempts.filter(timestamp => timestamp > oneHourAgo);

    if (recentAttempts.length !== attempts.length) {
        if (recentAttempts.length === 0) {
            failedLoginAttempts.delete(key);
        } else {
            failedLoginAttempts.set(key, recentAttempts);
        }
    }

    return recentAttempts.length;
};

const incrementFailedAttempts = (clientIP, identifier) => {
    const key = `${clientIP}:${identifier}`;
    const attempts = failedLoginAttempts.get(key) || [];
    attempts.push(Date.now());
    failedLoginAttempts.set(key, attempts);
};

const clearFailedAttempts = (clientIP, identifier) => {
    const key = `${clientIP}:${identifier}`;
    failedLoginAttempts.delete(key);
};

//Register pending
const registerPending = async (req, res) => {
    try {
        const { email, password, username, captchaToken } = req.body;

        const captchaValid = await verifyCaptcha(captchaToken);
        if (!captchaValid) {
            return res.status(400).json({ message: "Captcha verification failed" });
        }

        if (!email || !password || !username) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingUserByEmail = await User.getUserByEmail(email);
        if (existingUserByEmail) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const existingUserByUsername = await User.getUserByUsername(username);
        if (existingUserByUsername) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: 'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number and one special character',
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const registrationId = generateRegistrationId();

        pendingRegistrations.set(registrationId, {
            email,
            username,
            hashedPassword,
            captchaToken,
            timestamp: Date.now()
        });

        const otp = generateOTP();
        await storeOTP(email, otp, 'registration');
        await sendOTP(email, otp, 'registration');

        res.status(200).json({
            message: 'OTP sent to your email for verification',
            registrationId,
            email
        });

    } catch (error) {
        console.error('Registration pending error:', error);
        res.status(500).json({ message: 'Registration failed' });
    }
};

//register completion
const register = async (req, res) => {
    try {
        const { registrationId, otp } = req.body;

        if (!registrationId || !otp) {
            return res.status(400).json({ message: 'Registration ID and OTP are required' });
        }

        const pendingData = pendingRegistrations.get(registrationId);
        if (!pendingData) {
            return res.status(400).json({ message: 'Invalid or expired registration session' });
        }

        const otpResult = await verifyOTP(pendingData.email, otp, 'registration');
        if (!otpResult.status) {
            return res.status(400).json({ message: otpResult.message });
        }

        const user = await User.createUser({
            email: pendingData.email,
            username: pendingData.username,
            hash_password: pendingData.hashedPassword,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        pendingRegistrations.delete(registrationId);

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        const userObj = user.toObject ? user.toObject() : user;
        const { hash_password, ...userWithoutPassword } = userObj;

        res.status(200).json({
            message: 'Registration completed successfully',
            user: userWithoutPassword,
            accessToken
        });

    } catch (error) {
        console.error('Registration completion error:', error);
        res.status(500).json({ message: 'Registration failed' });
    }
};

//Login
const login = async (req, res) => {
    try {
        const { identifier, password, captchaToken } = req.body;
        const clientIP = req.ip;

        if (!identifier || !password) {
            return res.status(400).json({ message: 'Email/Username and password are required' });
        }

        //Check failed attempts for this IP/identifier combination
        const failedAttemptsCount = getFailedAttempts(clientIP, identifier);
        const requiresCaptcha = failedAttemptsCount >= 3;

        if (requiresCaptcha) {
            if (!captchaToken) {
                return res.status(400).json({
                    message: 'Please complete the captcha verification',
                    requiresCaptcha: true
                });
            }

            const captchaValid = await verifyCaptcha(captchaToken);
            if (!captchaValid) {
                return res.status(400).json({
                    message: "Captcha verification failed",
                    requiresCaptcha: true
                });
            }
        }

        let user = null;
        if (identifier.includes('@')) {
            user = await User.getUserByEmail(identifier);
        } else {
            user = await User.getUserByUsername(identifier);
        }

        const genericError = "Invalid credentials";

        if (!user) {
            await bcrypt.compare(password, '$2b$10$dummyHashToPreventTimingAttacks');
            incrementFailedAttempts(clientIP, identifier);
            return res.status(401).json({
                message: genericError,
                requiresCaptcha: getFailedAttempts(clientIP, identifier) >= 3
            });
        }

        const isMatch = await bcrypt.compare(password, user.hash_password);
        if (!isMatch) {
            incrementFailedAttempts(clientIP, identifier);
            return res.status(401).json({
                message: genericError,
                requiresCaptcha: getFailedAttempts(clientIP, identifier) >= 3
            });
        }
        clearFailedAttempts(clientIP, identifier);

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        const userObj = user.toObject ? user.toObject() : user;
        const { hash_password, ...userWithoutPassword } = userObj;

        res.json({
            user: userWithoutPassword,
            accessToken: accessToken,
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Login failed' });
    }
}

//Google login
const loginWithGoogle = async (req, res) => {
    try {
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({ message: "Authorization code is required" });
        }

        // Exchange code for tokens
        const tokenResponse = await axios.post("https://oauth2.googleapis.com/token", {
            code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: process.env.GOOGLE_REDIRECT_URI,
            grant_type: "authorization_code",
        }, {
            timeout: 10000
        });

        const { id_token } = tokenResponse.data;

        const userInfoResponse = await axios.get(
            `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${id_token}`,
            { timeout: 10000 }
        );

        const googleUser = userInfoResponse.data;

        if (!googleUser.email) {
            return res.status(400).json({ message: "Google account email not verified" }); 
        }

        let user = await User.getUserByEmail(googleUser.email);
        if (!user) {
            //Create username from email
            const username = googleUser.email.split('@')[0];

            user = await User.createUser({
                email: googleUser.email,
                username: username,
                hash_password: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        const userObj = user.toObject ? user.toObject() : user;
        const { hash_password, ...userWithoutPassword } = userObj;

        res.json({
            user: userWithoutPassword,
            accessToken,
        });

    } catch (error) {
        console.error("Google login failed:", error.response?.data || error.message);
        res.status(500).json({ message: "Google authentication failed" }); 
    }
};


//Logout
const logout = (req, res) => {
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        path: '/',
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

//Update user profile with validation
const updateProfile = async (req, res) => {
    try {
        const { username } = req.body;
        const user = await User.updateUser(req.user.id, {
            username,
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const userObj = user.toObject ? user.toObject() : user;
        const { hash_password, ...userWithoutPassword } = userObj;

        res.json({ user: userWithoutPassword });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ message: "Profile update failed" });
    }
};

const getCurrentUser = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
        const user = await User.getUserById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userObj = user.toObject ? user.toObject() : user;
        const { hash_password, ...userWithoutPassword } = userObj;
        return res.status(200).json(userWithoutPassword);
    } catch (error) {
        console.error('Get current user error:', error);
        return res.status(500).json({ message: 'Failed to get user data' });
    }
};

module.exports = {
    registerPending, 
    register,
    login,
    loginWithGoogle,
    logout,
    refresh,
    getCurrentUser,
    updateProfile,
    generateAccessToken,
    generateRefreshToken
};
