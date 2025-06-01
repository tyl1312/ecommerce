import express from 'express';
import courseController from '../controllers/courseController.js';
import { verifyJWT, isAdmin } from '../middlewares/auth/auth.js';
import upload from '../middlewares/upload/multer.js';
import csrfMiddleware, { verifyCsrfToken } from '../middlewares/auth/csrfProtection.js';

const router = express.Router();

// CREATE COURSE
router.post('/', verifyJWT, isAdmin, verifyCsrfToken, csrfMiddleware, upload.single('image'), courseController.createCourse);

// GET COURSES REFERENCE
router.get('/', verifyJWT, courseController.getCoursesReference);

// GET ALL COURSES
router.get('/all', verifyJWT, courseController.getAllCourses);

// GET MANY COURSES
router.get('/many', verifyJWT, courseController.getManyCourses);

// UPDATE COURSE BY ID
router.put('/edit/:id', verifyJWT, isAdmin, verifyCsrfToken, csrfMiddleware, upload.single('image'), courseController.updateCourseById);

// DELETE COURSE BY ID
router.delete('/delete/:id', verifyJWT, isAdmin, verifyCsrfToken, csrfMiddleware, courseController.deleteCourseById);

// DELETE MANY COURSES
router.delete('/deleteMany', verifyJWT, isAdmin, verifyCsrfToken, csrfMiddleware, courseController.deleteManyCourses);

// GET COURSE BY ID
router.get('/:id', verifyJWT, courseController.getCourseById);

export default router;