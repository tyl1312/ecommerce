import express from 'express';
import questionController from '../controllers/questionController.js';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';
import csrfMiddleware, { verifyCsrfToken } from '../middleware/csrfProtection.js';

const router = express.Router();

// CREATE QUIZ
router.post('/', authenticateToken, isAdmin, verifyCsrfToken, csrfMiddleware, questionController.createQuestion);

// GET ALL QUIZZES REFERENCE
router.get('/', authenticateToken, questionController.getAllQuestionsReference);

// GET ALL QUIZZES
router.get('/all', authenticateToken, questionController.getAllQuestions);

// GET MANY QUIZZES
router.get('/many', authenticateToken, questionController.getManyQuestions);

// UPDATE QUIZ
router.put('/edit/:id', authenticateToken, isAdmin, verifyCsrfToken, csrfMiddleware, questionController.updateQuestionById);

// DELETE QUIZ BY ID
router.delete('/delete/:id', authenticateToken, isAdmin, verifyCsrfToken, csrfMiddleware, questionController.deleteQuestionById);

// DELETE MANY QUIZZES
router.delete('/deleteMany', authenticateToken, isAdmin, verifyCsrfToken, csrfMiddleware, questionController.deleteManyQuestions);

// GET QUIZ BY ID
router.get('/:id', authenticateToken, questionController.getQuestionById);

export default router;