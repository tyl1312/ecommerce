import express from 'express';
import quizController from '../controllers/quizController.js';
import { verifyJWT, isAdmin } from '../middlewares/auth/auth.js';
import csrfMiddleware, { verifyCsrfToken } from '../middlewares/auth/csrfProtection.js';

const router = express.Router();

// CREATE QUIZ
router.post('/', verifyJWT, isAdmin, verifyCsrfToken, csrfMiddleware, quizController.createQuiz);

// GET ALL QUIZZES
router.get('/', verifyJWT, quizController.getAllQuizzes);

// GET QUESTION IN QUIZ
router.get('/questions/:id', verifyJWT, quizController.getQuestionsByQuizId);

// GET MANY QUIZZES
router.get('/many', verifyJWT, quizController.getManyQuizzes);

// UPDATE QUIZ BY ID
router.put('/edit/:id', verifyJWT, isAdmin, verifyCsrfToken, csrfMiddleware, quizController.updateQuizById);

// DELETE QUIZ BY ID
router.delete('/delete/:id', verifyJWT, isAdmin, verifyCsrfToken, csrfMiddleware, quizController.deleteQuizById);

// DELETE MANY QUIZZES
router.delete('/deleteMany', verifyJWT, isAdmin, verifyCsrfToken, csrfMiddleware, quizController.deleteManyQuizzes);

// GET QUIZ BY ID
router.get('/:id', verifyJWT, quizController.getQuizById);

export default router;