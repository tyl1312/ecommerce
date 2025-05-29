const express = require('express');
const authController = require('../controllers/auth');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

//Authentication routes
router.post('/register', authController.register);
router.post('/login', authController.login);

//Google OAuth route
router.post('/google', authController.loginWithGoogle);

//OTP routes
router.post('/request-otp', authController.requestOTP);
router.post('/verify-otp', authController.verifyOtp);

//Logout route
router.post('/logout', authController.logout);

router.get('/user', authMiddleware, authController.getCurrentUser);
router.put('/user/', authMiddleware, authController.updateProfile);
router.post('/refresh', authController.refresh);

module.exports = router;