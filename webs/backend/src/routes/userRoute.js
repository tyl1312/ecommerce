import express from 'express';
import userController from '../controllers/userController.js';
import { verifyJWT, isAdmin } from '../middlewares/auth/auth.js';
import { loginRateLimiter, forgotPasswordRateLimiter, registerRateLimiter } from '../middlewares/rateLimit/rate-limit.js';
import csrfMiddleware, { verifyCsrfToken } from '../middlewares/auth/csrfProtection.js';

const router = express.Router();

// REGISTER USER
router.post('/register', registerRateLimiter, csrfMiddleware, userController.register);

// LOGIN USER
router.post('/login', loginRateLimiter, csrfMiddleware, userController.login);

// VERIFY EMAIL
router.get('/verify-email/:token', userController.verifyEmail);

// RESEND EMAIL
router.post('/resend-email', verifyJWT, userController.resendEmail);

// LOGOUT USER
router.post('/logout', verifyJWT, verifyCsrfToken, userController.logout);

// GET USER PROFILE
router.get('/profile', verifyJWT, userController.getProfile);

// UPDATE USER PROFILE
router.put('/profile', verifyJWT, verifyCsrfToken, csrfMiddleware, userController.updateProfile);

// CHANGE PASSWORD
router.put('/change-password', verifyJWT, verifyCsrfToken, csrfMiddleware, userController.changePassword);

// FORGOT PASSWORD
router.post('/forgot-password', forgotPasswordRateLimiter, userController.forgotPassword);

// RESET PASSWORD
router.post('/reset-password/:token', userController.resetPassword);

// VALIDATE RESET TOKEN
router.post('/validate-reset-token', userController.validateResetToken);

// REFRESH TOKEN
router.post('/refresh-token', userController.refreshToken);

// GET EXPERIENCE 
router.get('/experience', verifyJWT, userController.getExperienceAllUsers);

// GET ALL USERS
router.get('/all', verifyJWT, isAdmin, userController.getAllUsers);

// CHECK LOGIN STATUS
router.get('/check-login', verifyJWT, userController.checkLogin);

// GET USER REFERENCE
router.get('/', verifyJWT, isAdmin, userController.getUserReference);

// DELETE USER
router.delete('/users', verifyJWT, verifyCsrfToken, csrfMiddleware, userController.selfDeleteAccount);

// DELETE USER BY ADMIN
router.delete('/delete/:id', verifyJWT, isAdmin, verifyCsrfToken, csrfMiddleware, userController.adminDeleteAccount);

// DELETE MANY USERS BY ADMIN
router.delete('/deleteMany', verifyJWT, isAdmin, verifyCsrfToken, csrfMiddleware, userController.adminDeleteManyAccount);

// EDIT USER ROLE AND EXPERIENCE BY ADMIN
router.put('/edit/:id', verifyJWT, isAdmin, verifyCsrfToken, csrfMiddleware, userController.adminEditUser);

// GET USER BY ID
router.get('/:id', verifyJWT, isAdmin, userController.getUserById);

export default router;
