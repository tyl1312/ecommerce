const bcrypt = require('bcrypt');
const User = require('../models/User');
const Otp = require('../models/Otp');

const resetPassword = async (req, res) => {
    try {
        const { email, password, confirmPassword } = req.body;

        if (!email || !password || !confirmPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'
            });
        }

        const otpRecord = await Otp.findOne({ 
            email, 
            purpose: 'reset-password', 
            verified: true 
        });

        if (!otpRecord) {
            return res.status(401).json({ message: 'Please verify your OTP first' });
        }

        // Find user
        const user = await User.getUserByEmail(email);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        await User.updateUser(user._id, {
            hash_password: hashedPassword
        });

        await Otp.deleteOne({ _id: otpRecord._id });

        res.status(200).json({
            message: 'Password reset successful'
        });

    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ message: 'Password reset failed' });
    }
};

module.exports = {
    resetPassword
};