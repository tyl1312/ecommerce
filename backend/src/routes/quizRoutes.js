import express from 'express';
import quizController from '../controllers/quizController.js';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';
import csrfMiddleware, { verifyCsrfToken } from '../middleware/csrfProtection.js';

const router = express.Router();

// CREATE QUIZ
router.post('/', authenticateToken, isAdmin, verifyCsrfToken, csrfMiddleware, quizController.createQuiz);

// GET ALL QUIZZES
router.get('/', authenticateToken, quizController.getAllQuizzes);

// GET QUESTION IN QUIZ
router.get('/questions/:id', authenticateToken, quizController.getQuestionsByQuizId);

// GET MANY QUIZZES
router.get('/many', authenticateToken, quizController.getManyQuizzes);

// UPDATE QUIZ BY ID
router.put('/edit/:id', authenticateToken, isAdmin, verifyCsrfToken, csrfMiddleware, quizController.updateQuizById);

// DELETE QUIZ BY ID
router.delete('/delete/:id', authenticateToken, isAdmin, verifyCsrfToken, csrfMiddleware, quizController.deleteQuizById);

// DELETE MANY QUIZZES
router.delete('/deleteMany', authenticateToken, isAdmin, verifyCsrfToken, csrfMiddleware, quizController.deleteManyQuizzes);

// GET QUIZ BY ID
router.get('/:id', authenticateToken, quizController.getQuizById);

export default router;