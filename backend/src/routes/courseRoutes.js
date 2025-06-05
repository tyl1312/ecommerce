import express from 'express';
import courseController from '../controllers/courseController.js';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';
import upload from '../middleware/multer.js';

const router = express.Router();

// CREATE COURSE 
router.post('/', authenticateToken, isAdmin, upload.single('image'), courseController.createCourse);

// GET COURSES REFERENCE - This should handle /api/courses
router.get('/', authenticateToken, courseController.getCoursesReference);

// GET ALL COURSES - Specific routes BEFORE parameterized routes
router.get('/all', authenticateToken, courseController.getAllCourses);

// GET MANY COURSES
router.get('/many', authenticateToken, courseController.getManyCourses);

// UPDATE COURSE BY ID 
router.put('/edit/:id', authenticateToken, isAdmin, upload.single('image'), courseController.updateCourseById);

// DELETE COURSE BY ID 
router.delete('/delete/:id', authenticateToken, isAdmin, courseController.deleteCourseById);

// DELETE MANY COURSES 
router.delete('/deleteMany', authenticateToken, isAdmin, courseController.deleteManyCourses);

// IMPORTANT: PUT PARAMETERIZED ROUTES LAST
// GET COURSE BY ID - This must be LAST to avoid conflicts
router.get('/:id', authenticateToken, courseController.getCourseById);

export default router;