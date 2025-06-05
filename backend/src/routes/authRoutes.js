import express from 'express';
import authController from '../controllers/authController.js';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js'; 
import otpController from '../controllers/otpController.js';
import resetPasswordController from '../controllers/resetPasswordController.js';

import { 
    loginLimiter, 
    registrationLimiter, 
    otpRequestLimiter, 
    otpVerificationLimiter, 
    passwordResetLimiter 
} from '../middleware/rateLimiter.js';

const router = express.Router();

// Authentication routes
router.post('/register-pending', registrationLimiter, authController.registerPending);
router.post('/register', otpVerificationLimiter, authController.register);
router.post('/login', loginLimiter, authController.login);

// Reset password routes
router.post('/reset-password', passwordResetLimiter, resetPasswordController.resetPassword);

// Google OAuth route
router.post('/google', authController.loginWithGoogle);

// OTP routes
router.post('/otp/request', otpRequestLimiter, otpController.requestOTP);
router.post('/otp/verify', otpVerificationLimiter, otpController.verifyOtp);

// User management routes
router.post('/logout', authController.logout);
router.get('/user', authenticateToken, authController.getCurrentUser); 
router.put('/profile', authenticateToken, authController.updateProfile); 
router.put('/change-password', authenticateToken, authController.changePassword); 
router.post('/refresh', authController.refresh);
router.get('/experience', authenticateToken, authController.getExperience);

// Add this route for listing users
router.get('/users', authenticateToken, isAdmin, authController.getAllUsers);

export default router;
