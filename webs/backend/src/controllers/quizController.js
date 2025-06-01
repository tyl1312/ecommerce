import Course from "../models/Course.js";
import Quiz from "../models/Quiz.js";
import Question from "../models/Question.js";
import Progress from "../models/Progress.js";
import { BadRequest, NotFound } from "../core/error.response.js";
import { SuccessResponse, Created } from "../core/success.response.js";
import { handleErrorResponse } from "../helper/handleErrorResponse.js";

const quizController = {
    
    // Method: POST
    // Path: /quiz/
    createQuiz: async (req, res) => {
        try {
            const { title, course, description } = req.body;

            const newQuiz = new Quiz({ title, course, description });
            await newQuiz.save();

            if (course) {
                await Course.updateMany(
                    { _id: { $in: course } },
                    { $push: { quiz: newQuiz._id } }
                );
            }

            new Created({ message: "Quiz created successfully", req });
            res.status(201).json(newQuiz);
        } catch (error) {
            return handleErrorResponse(error, req, res);
        }
    },

    // Method: GET
    // Path: /quiz/
    getAllQuizzes: async (req, res) => {
        try {
            const quizzes = await Quiz.find().populate('course', 'courseTitle');
            if (!quizzes || quizzes.length === 0) {
                throw new NotFound({ message: 'No quizzes found', req }, 'info');
            }

            // Pagination
            const page = parseInt(req.query.page) || 1;
            const perPage = parseInt(req.query.perPage) || 10;
            const startIndex = (page - 1) * perPage;
            const endIndex = page * perPage;
            const total = quizzes.length;

            // Create data for the current page
            const data = quizzes.slice(startIndex, endIndex);

            new SuccessResponse({ message: "Get all quizzes successfully", req });
            return res.status(200).json({ items: data, page, perPage, total });
        } catch (error) {
            return handleErrorResponse(error, req, res);
        }
    },

    // Method: GET
    // Path: /quiz/many
    getManyQuizzes: async (req, res) => {
        try {
            const quizIds = req.query.ids;
            if (!quizIds || quizIds.length === 0) {
                throw new BadRequest({ message: 'No quiz IDs provided', req }, 'warn');
            }

            const quizzes = await Quiz.find({ _id: { $in: quizIds } }).populate('course', 'courseTitle');
            if (!quizzes || quizzes.length === 0) {
                throw new NotFound({ message: 'No quizzes found', req }, 'info');
            }

            new SuccessResponse({ message: "Get many quizzes successfully", req });
            return res.status(200).json({ items: quizzes });
        } catch (error) {
            return handleErrorResponse(error, req, res);
        }
    },

    // Method: GET
    // Path: /quiz/:id
    getQuizById: async (req, res) => {
        try {
            const quizId = req.params.id;
            const quiz = await Quiz.findById(quizId);
            if (!quiz) {
                throw new NotFound({ message: 'Quiz not found', req }, 'info');
            }

            new SuccessResponse({ message: "Get quiz by ID successfully", req });
            return res.status(200).json(quiz);
        } catch (error) {
            return handleErrorResponse(error, req, res);
        }
    },

    // Method: GET
    // Path: /quiz/questions/:id
    getQuestionsByQuizId: async (req, res) => {
        try {
            const quizId = req.params.id;
            const quiz = await Quiz.findById(quizId).populate('question').select('title question');
            if (!quiz) {
                throw new NotFound({ message: 'Quiz not found', req }, 'info');
            }
            
            new SuccessResponse({ message: "Get questions by quiz ID successfully", req });
            return res.status(200).json(quiz);
        } catch (error) {
            return handleErrorResponse(error, req, res);
        }
    },

    // Method: PUT
    // Path: /quiz/edit/:id
    updateQuizById: async (req, res) => {
        try {
            const quizId = req.params.id;
            const updateFields = req.body;

            const quiz = await Quiz.findOneAndUpdate(
                { _id: quizId },
                { $set: updateFields },
                { new: true }
            );
            if (!quiz) {
                throw new NotFound({ message: 'Quiz not found', req }, 'info');
            }

            await Course.updateMany(
                { quiz: quizId },
                { $pull: { quiz: quizId } }
            );

            if (updateFields.course && updateFields.course.length > 0) {
                await Course.updateMany(
                    { _id: { $in: updateFields.course } },
                    { $push: { quiz: quizId } }
                );
            }

            return new SuccessResponse({ message: "Quiz updated successfully", req }).send(res);
        } catch (error) {
            return handleErrorResponse(error, req, res);
        }
    },

    // Method: DELETE
    // Path: /quiz/delete/:id
    deleteQuizById: async (req, res) => {
        try {
            const quizId = req.params.id;

            await Course.updateMany(
                { quiz: quizId },
                { $pull: { quiz: quizId } }
            );

            await Question.updateMany(
                { quiz: quizId },
                { $unset: { quiz: 1 } }
            );

            await Progress.updateMany(
                { 'completedQuizzes.quizId': quizId },
                { $pull: { completedQuizzes: { quizId: quizId } } }
            );

            await Quiz.findByIdAndDelete(quizId);
            return new SuccessResponse({ message: "Quiz deleted successfully", req }).send(res);
        } catch (error) {
            return handleErrorResponse(error, req, res);
        }
    },

    // Method: DELETE
    // Path: /quiz/deleteMany
    deleteManyQuizzes: async (req, res) => {
        try {
            const quizIds = req.body.ids;

            if (!Array.isArray(quizIds)) {
                quizIds = [quizIds];
            }
            console.log(quizIds);
            if (!quizIds || quizIds.length === 0) {
                throw new BadRequest({ message: 'No quiz IDs provided', req }, 'info');
            }

            await Course.updateMany(
                { quiz: { $in: quizIds } },
                { $pull: { quiz: { $in: quizIds } } }
            );

            await Question.updateMany(
                { quiz: { $in: quizIds } },
                { $unset: { quiz: 1 } }
            );

            await Progress.updateMany(
                { 'completedQuizzes.quizId': { $in: quizIds } },
                { $pull: { completedQuizzes: { quizId: { $in: quizIds } } } }
            );

            await Quiz.deleteMany({ _id: { $in: quizIds } });

            return new SuccessResponse({ message: "Quizzes deleted successfully", req }).send(res);
        } catch (error) {
            return handleErrorResponse(error, req, res);
        }
    },
};

export default quizController;
