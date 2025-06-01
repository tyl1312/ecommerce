import express from 'express';
import questionController from '../controllers/questionController.js';
import { verifyJWT, isAdmin } from '../middlewares/auth/auth.js';
import csrfMiddleware, { verifyCsrfToken } from '../middlewares/auth/csrfProtection.js';

const router = express.Router();

// CREATE QUIZ
router.post('/', verifyJWT, isAdmin, verifyCsrfToken, csrfMiddleware, questionController.createQuestion);

// GET ALL QUIZZES REFERENCE
router.get('/', verifyJWT, questionController.getAllQuestionsReference);

// GET ALL QUIZZES
router.get('/all', verifyJWT, questionController.getAllQuestions);

// GET MANY QUIZZES
router.get('/many', verifyJWT, questionController.getManyQuestions);

// UPDATE QUIZ
router.put('/edit/:id', verifyJWT, isAdmin, verifyCsrfToken, csrfMiddleware, questionController.updateQuestionById);

// DELETE QUIZ BY ID
router.delete('/delete/:id', verifyJWT, isAdmin, verifyCsrfToken, csrfMiddleware, questionController.deleteQuestionById);

// DELETE MANY QUIZZES
router.delete('/deleteMany', verifyJWT, isAdmin, verifyCsrfToken, csrfMiddleware, questionController.deleteManyQuestions);

// GET QUIZ BY ID
router.get('/:id', verifyJWT, questionController.getQuestionById);

export default router;