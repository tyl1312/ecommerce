const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const otpController = require('../controllers/otpController');
const resetPasswordController = require('../controllers/resetPasswordController')

const router = express.Router();

//Authentication routes
router.post('/register-pending', authController.registerPending);
router.post('/register', authController.register);
router.post('/login', authController.login);

//Reset password routes
router.post('/reset-password', resetPasswordController.resetPassword)
//Google OAuth route
router.post('/google', authController.loginWithGoogle);

//OTP routes
router.post('/otp/request', otpController.requestOTP);
router.post('/otp/verify', otpController.verifyOtp);

//Logout route
router.post('/logout', authController.logout);

router.get('/user', authMiddleware, authController.getCurrentUser);
router.put('/profile', authMiddleware, authController.updateProfile);
router.post('/refresh', authController.refresh);

module.exports = router;
