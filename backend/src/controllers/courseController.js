import Course from '../models/Course.js';
import Quiz from '../models/Quiz.js';
import { bucket } from '../config/firebaseConnection.js';
import { fileTypeFromBuffer } from 'file-type';
import { v4 as uuidv4 } from 'uuid';
import { BadRequest, NotFound, InternalServerError } from '../core/error.response.js';
import { SuccessResponse, Created } from '../core/success.response.js';
import { handleErrorResponse } from '../helper/handleErrorResponse.js';

const courseController = {
    // Method: POST
    // Path: /course
    createCourse: async (req, res) => {
        try {
            const { courseTitle, description, estimatedTime } = req.body;
            let imageUrl = '';

            const file = req.file;
            if (file) {
                const fileType = await fileTypeFromBuffer(file.buffer);
                if (!fileType || !['image/jpeg', 'image/png', 'image/gif'].includes(fileType.mime)) {
                    throw new BadRequest({ message: `Invalid file type. Only JPEG, PNG, and GIF are allowed. Attempted to upload: ${fileType.mime}`, req })
                }

                const blob = bucket.file(uuidv4());
                const blobStream = blob.createWriteStream({
                    metadata: {
                        contentType: file.mimetype
                    }
                });

                await new Promise((resolve, reject) => {
                    blobStream.on('error', (err) => {
                        new InternalServerError({ message: err.message, req });
                        reject(err);
                    });

                    blobStream.on('finish', () => {
                        imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURI(blob.name)}?alt=media`;
                        new SuccessResponse({ message: `Image uploaded successfully: ${imageUrl}`, req });
                        resolve();
                    });

                    blobStream.end(file.buffer);
                });

            }

            const newCourse = new Course({ courseTitle, description, estimatedTime, image: imageUrl });
            await newCourse.save();

            if (req.body.quiz) {
                const quiz = await Quiz.find({ _id: { $in: req.body.quiz } });
                if (!quiz || quiz.length !== req.body.quiz.length) {
                    return new NotFound({ message: 'Quiz not found', req }, 'info').send(res);
                }
                await quiz.updateMany({ $push: { course: newCourse._id } });
            }

            return new Created({ message: 'Course created successfully', req }).send(res);
        } catch (error) {
            return handleErrorResponse(error, req, res);
        }
    },

    // Method: GET
    // Path: /course/all
    getAllCourses: async (req, res) => {
        try {
            let courses = await Course.find().populate('quiz', 'title description');
            
            // If no courses are found, create some sample data
            if (!courses || courses.length === 0) {
                const sampleCourses = [
                    {
                        courseTitle: "Web Security Fundamentals",
                        description: "Learn the basics of web security including common vulnerabilities and how to protect against them.",
                        level: "Beginner",
                        estimatedTime: 120,
                        quiz: []
                    },
                    {
                        courseTitle: "Advanced Authentication",
                        description: "Deep dive into authentication systems, JWT, OAuth and modern security practices.",
                        level: "Intermediate",
                        estimatedTime: 180,
                        quiz: []
                    }
                ];
                
                // Insert sample courses
                courses = await Course.insertMany(sampleCourses);
                
                return res.status(200).json({
                    items: courses,
                    total: courses.length,
                    message: "Sample courses created successfully"
                });
            }

            return res.status(200).json({
                items: courses,
                total: courses.length,
                message: "Courses retrieved successfully"
            });
        } catch (error) {
            return handleErrorResponse(error, req, res);
        }
    },

    // Method: GET
    // Path: /course
    getCoursesReference: async (req, res) => {
        try {
            const courses = await Course.find();
            if (!courses || courses.length === 0) {
                throw new NotFound({ message: 'No courses found', req }, 'info');
            }

            // Pagination
            const page = parseInt(req.query.page) || 1;
            const perPage = parseInt(req.query.perPage) || 10;
            const startIndex = (page - 1) * perPage;
            const endIndex = page * perPage;
            const total = courses.length;

            // Create data for the current page
            const data = courses.slice(startIndex, endIndex);

            new SuccessResponse({ message: 'Courses found', req });
            return res.status(200).json({ items: data, page, perPage, total });
        } catch (error) {
            return handleErrorResponse(error, req, res);
        }
    },

    // Method: GET
    // Path: /course/:id
    getCourseById: async (req, res) => {
        try {
            const courseId = req.params.id;
            const course = await Course.findById(courseId);
            if (!course) {
                throw new NotFound({ message: 'Course not found', req }, 'info');
            }

            new SuccessResponse({ message: 'Course found', req });
            return res.status(200).json(course);
        } catch (error) {
            return handleErrorResponse(error, req, res);
        }
    },

    // Method: GET
    // Path: /course/many
    getManyCourses: async (req, res) => {
        try {
            console.log('getManyCourses - req.query:', req.query); 
            
            let courseIds = req.query.ids || req.query['ids[]'];
            
            console.log('Raw courseIds:', courseIds);   

            if (Array.isArray(courseIds)) {
                console.log('Course IDs received as array:', courseIds);
            } else if (typeof courseIds === 'string') {
                courseIds = courseIds.includes(',') ? courseIds.split(',') : [courseIds];
                console.log('Course IDs converted from string:', courseIds);
            } else {
                courseIds = [];
            }
            
            if (!courseIds || courseIds.length === 0) {
                throw new BadRequest({ message: 'No course IDs provided', req }, 'info');
            }
            
            console.log('Final processed courseIds:', courseIds); 

            const courses = await Course.find({ _id: { $in: courseIds } }).select('courseTitle');
            if (!courses || courses.length === 0) {
                throw new NotFound({ message: 'No courses found', req }, 'info');
            }

            new SuccessResponse({ message: 'Courses found', req });
            return res.status(200).json({ items: courses });
        } catch (error) {
            return handleErrorResponse(error, req, res);
        }
    },

    // Method: PUT
    // Path: /course/edit/:id
    updateCourseById: async (req, res) => {
        try {
            const courseId = req.params.id;
            const { courseTitle, description, estimatedTime, quiz, level } = req.body;
            let updateFields = { courseTitle, description, estimatedTime, level };
            let imageUrl = '';

            const file = req.file;
            if (file) {
                const fileType = await fileTypeFromBuffer(file.buffer);
                if (!fileType || !['image/jpeg', 'image/png', 'image/gif'].includes(fileType.mime)) {
                    throw new BadRequest({ message: `Invalid file type. Only JPEG, PNG, and GIF are allowed. Attempted to upload: ${fileType.mime}`, req });
                }

                const blob = bucket.file(uuidv4());
                const blobStream = blob.createWriteStream({
                    metadata: {
                        contentType: file.mimetype
                    }
                });

                await new Promise((resolve, reject) => {
                    blobStream.on('error', (err) => {
                        new InternalServerError({ message: err.message, req });
                        reject(err);
                    });

                    blobStream.on('finish', () => {
                        imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURI(blob.name)}?alt=media`;
                        new SuccessResponse({ message: `Image uploaded successfully: ${imageUrl}`, req });
                        resolve();
                    });

                    blobStream.end(file.buffer);
                });

                updateFields.image = imageUrl;
            }

            // Convert quiz from string to array of ObjectIds
            if (quiz) {
                const quizIds = quiz.split(',')
                updateFields.quiz = quizIds;
            }

            const course = await Course.findOneAndUpdate(
                { _id: courseId },
                { $set: updateFields },
                { new: true }
            );

            if (!course) {
                throw new NotFound({ message: 'Course not found', req }, 'info');
            }

            await Quiz.updateMany(
                { course: course._id },
                { $pull: { course: course._id } }
            );

            if (updateFields.quiz && updateFields.quiz.length > 0) {
                await Quiz.updateMany(
                    { _id: { $in: updateFields.quiz } },
                    { $push: { course: course._id } }
                );
            }

            return new SuccessResponse({ message: 'Course updated successfully', req }).send(res);
        } catch (error) {
            return handleErrorResponse(error, req, res);
        }
    },

    // Method: DELETE
    // Path: /course/delete/:id
    deleteCourseById: async (req, res) => {
        try {
            const courseId = req.params.id;

            await Quiz.updateMany(
                { course: courseId }, // Tìm tất cả các quiz liên quan đến course
                { $pull: { course: courseId } }
            );

            const deletedCourse = await Course.findByIdAndDelete(courseId);
            if (!deletedCourse) {
                throw new NotFound({ message: 'Course not found', req }, 'info');
            }

            return new SuccessResponse({ message: 'Course deleted successfully', req }).send(res);
        } catch (error) {
            return handleErrorResponse(error, req, res);
        }
    },

    // Method: DELETE
    // Path: /course/deleteMany
    deleteManyCourses: async (req, res) => {
        try {
            const courseIds = req.body.ids;
            if (!courseIds || courseIds.length === 0) {
                throw new BadRequest({ message: 'No course IDs provided', req }, 'info');
            }

            await Quiz.updateMany(
                { course: { $in: courseIds } },
                { $pullAll: { course: courseIds } }
            );

            await Course.deleteMany({ _id: { $in: courseIds } });

            return new SuccessResponse({ message: 'Courses deleted successfully', req }).send(res);
        } catch (error) {
            return handleErrorResponse(error, req, res);
        }
    },
};

export default courseController;
