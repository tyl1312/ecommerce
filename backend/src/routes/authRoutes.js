const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const otpController = require('../controllers/otpController');
const resetPasswordController = require('../controllers/resetPasswordController');

const { 
    loginLimiter, 
    registrationLimiter, 
    otpRequestLimiter, 
    otpVerificationLimiter, 
    passwordResetLimiter 
} = require('../middleware/rateLimiter');

const router = express.Router();

//Authentication routes
router.post('/register-pending', registrationLimiter, authController.registerPending);
router.post('/register', otpVerificationLimiter, authController.register);
router.post('/login', loginLimiter, authController.login);

//Reset password routes
router.post('/reset-password', passwordResetLimiter, resetPasswordController.resetPassword);

//Google OAuth route
router.post('/google', authController.loginWithGoogle);

//OTP routes
router.post('/otp/request', otpRequestLimiter, otpController.requestOTP);
router.post('/otp/verify', otpVerificationLimiter, otpController.verifyOtp);

//Other routes
router.post('/logout', authController.logout);
router.get('/user', authMiddleware, authController.getCurrentUser);
router.put('/profile', authMiddleware, authController.updateProfile);
router.post('/refresh', authController.refresh);

module.exports = router;
