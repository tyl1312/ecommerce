const jwt = require('jsonwebtoken');
const axios = require('axios');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { generateOTP, sendOTP, storeOTP, verifyOTP } = require('../utils/otp');

const requestOTP = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }
    const otp = generateOTP();
    await sendOTP(email, otp);
    await storeOTP(email, otp);
    res.status(200).json({ message: 'OTP sent' });
}

const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

    const valid = await verifyOTP(email, otp);
    if (valid) {
        res.json({ success: true });
    } else {
        res.status(400).json({ message: "Invalid or expired OTP" });
    }
};

const generateAccessToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            phone_number: user.phone_number,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15s' }
    );
};

const refresh = (req, res) => {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: "No refresh token" });

    try {
        const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        const accessToken = generateAccessToken({ _id: payload.id, email: payload.email, phone_number: payload.phone_number });
        res.json({ accessToken });
    } catch (err) {
        return res.status(403).json({ message: "Invalid refresh token" });
    }
};

const generateRefreshToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            phone_number: user.phone_number,
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
    );
};

const verifyCaptcha = async (captchaToken) => {
    const secret = process.env.SECRET_KEY;
    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${captchaToken}`;
    try {
        const response = await axios.post(url);
        return response.data.success;
    } catch (err) {
        return false;
    }
};

const register = async (req, res) => {
    try {
        const { email, password, phone_number, first_name, last_name, home_address, captchaToken } = req.body;

        const captchaValid = await verifyCaptcha(captchaToken);
        if (!captchaValid) {
            return res.status(400).json({ message: "Captcha verification failed" });
        }

        if (!email || !password || !first_name || !last_name || !phone_number || !home_address) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingUserByEmail = await User.getUserByEmail(email);
        if (existingUserByEmail) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const existingUserByNumber = await User.getUserByNumber(phone_number);
        if (existingUserByNumber) {
            return res.status(400).json({ message: 'Phone number already exists' });
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: 'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number and one special character',
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userData = {
            email,
            phone_number,
            first_name,
            last_name,
            home_address,
            hash_password: hashedPassword,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        const user = await User.createUser(userData);
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
        return res.status(200).json({
            user: userWithoutPassword,
            accessToken: accessToken,
            refreshToken: refreshToken
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const login = async (req, res) => {
    try {
        const { identifier, password, captchaToken } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({ message: 'Email/Phone number and password are required' });
        }

        const captchaValid = await verifyCaptcha(captchaToken);
        if (!captchaValid) {
            return res.status(400).json({ message: "Captcha verification failed" });
        }

        let user = await User.getUserByEmail(identifier);
        if (!user) {
            user = await User.getUserByNumber(identifier);
        }
        if (!user) {
            return res.status(400).json({ message: 'Invalid email/phone or password' });
        }

        const isMatch = await bcrypt.compare(password, user.hash_password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
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
            accessToken: accessToken,
            refreshToken: refreshToken
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

const loginWithGoogle = async (req, res) => {
    const { code, captchaToken } = req.body;
    const tokenEndpoint = "https://oauth2.googleapis.com/token";

    const captchaValid = await verifyCaptcha(captchaToken);
        if (!captchaValid) {
            return res.status(400).json({ message: "Captcha verification failed" });
        }

    try {
        const response = await axios.post(tokenEndpoint, {
            code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: process.env.GOOGLE_REDIRECT_URI,
            grant_type: "authorization_code",
        });

        const { id_token } = response.data;

        const userInfoRes = await axios.get(
            `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${id_token}`
        );
        const googleUser = userInfoRes.data;

        if (!googleUser.email) {
            return res.status(400).json({ error: "Google account email not found" });
        }

        let user = await User.getUserByEmail(googleUser.email);
        if (!user) {
            user = await User.createUser({
                email: googleUser.email,
                first_name: googleUser.given_name || "",
                last_name: googleUser.family_name || "",
                phone_number: "",
                home_address: "",
                hash_password: "",
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
            refreshToken
        });
    } catch (error) {
        console.error("Google login failed:", error.response?.data || error.message);
        res.status(500).json({ error: "Google authentication failed" });
    }
};

const logout = (req, res) => {
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        path: '/',
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

const updateProfile = async (req, res) => {
    try {
        const { phone_number, home_address, first_name, last_name } = req.body;
        const user = await User.updateUser(req.user.id, {
            phone_number,
            home_address,
            first_name,
            last_name
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const userObj = user.toObject ? user.toObject() : user;
        const { hash_password, ...userWithoutPassword } = userObj;
        res.json({ user: userWithoutPassword });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ message: "Server error" });
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
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    register,
    login,
    loginWithGoogle,
    logout,
    refresh,
    getCurrentUser,
    updateProfile,
    requestOTP,
    verifyOtp
};
