import { generateOTP, sendOTP, storeOTP, verifyOTP } from '../utils/otpUtils.js';
import User, { getUserByEmail } from '../models/User.js';

const requestOTP = async (req, res) => {
    try {
        const { email, purpose = 'registration' } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await getUserByEmail(email);

        if (purpose === 'reset-password' && !user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const otp = generateOTP();
        await storeOTP(email, otp, purpose);
        await sendOTP(email, otp, purpose);

        res.status(200).json({
            message: 'OTP sent to your email',
            email
        });

    } catch (error) {
        console.error('OTP request error:', error);
        res.status(500).json({ message: 'OTP request failed' });
    }
};

const verifyOtp = async (req, res) => {
    try {
        const { email, otp, purpose = 'registration' } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        const result = await verifyOTP(email, otp, purpose);

        if (!result.status) {
            return res.status(400).json({ message: result.message });
        }

        if (purpose === 'registration') {
            return res.status(200).json({
                message: 'OTP verified successfully',
                email,
                verified: true,
                purpose
            });
        }

        if (purpose === 'reset-password') {
            const user = await getUserByEmail(email);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
        }

        return res.status(200).json({
            message: result.message,
            email,
            verified: true,
            purpose
        });

    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({ message: 'OTP verification failed' });
    }
};

// Export individual functions
export { requestOTP, verifyOtp };

// Default export
export default {
    requestOTP,
    verifyOtp
};