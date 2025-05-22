const express = require('express');
const authController = require('../controllers/auth');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

//Authentication routes
router.post('/register', authController.signup);
router.post('/login', authController.login);

//Google OAuth route
router.post('/google', authController.loginWithGoogle);

//Logout route
router.post('/logout', authController.logout);

router.get('/user', authMiddleware, authController.getCurrentUser);
router.put('/user/', authMiddleware, authController.updateProfile);
router.post('/refresh', authController.refresh);

module.exports = router;