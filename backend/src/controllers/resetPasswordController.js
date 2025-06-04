import bcrypt from 'bcrypt';
import { verifyOTP } from '../utils/otpUtils.js';
import { getUserByEmail, updateUser } from '../models/User.js';

const resetPassword = async (req, res) => {
    try {
        const { email, password,  } = req.body;

        if (!email || !password ) {
            return res.status(400).json({ 
                message: 'Email, OTP, and new password are required' 
            });
        }

        const user = await getUserByEmail(email);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: 'Password must be at least 8 characters long with uppercase, lowercase, number, and special character'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        await updateUser(user._id, { hash_password: hashedPassword });

        res.status(200).json({ message: 'Password reset successfully' });

    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ message: 'Password reset failed' });
    }
};

export default {
    resetPassword
};