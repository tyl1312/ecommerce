import Question from "../models/Question.js";
import Quiz from "../models/Quiz.js";
import { BadRequest, NotFound } from "../core/error.response.js";
import { SuccessResponse, Created } from "../core/success.response.js";
import { handleErrorResponse } from "../helper/handleErrorResponse.js";

const questionController = {
    // Method: POST
    // Path: /question/
    createQuestion: async (req, res) => {
        try {
            const { question, correctOption, incorrectOptions } = req.body;
            const newQuestion = new Question({ question, correctOption, incorrectOptions });
            await newQuestion.save();

            new Created({ message: "Question created successfully", req });
            return res.status(201).json(newQuestion);
        } catch (error) {
            return handleErrorResponse(error, req, res);
        }
    },

    // Method: GET
    // Path: /question/
    getAllQuestionsReference: async (req, res) => {
        try {
            const questions = await Question.find();
            if (!questions || questions.length === 0) {
                throw new NotFound({ message: 'No questions found', req }, 'info');
            }

            // Pagination
            const page = parseInt(req.query.page) || 1;
            const perPage = parseInt(req.query.perPage) || 10;
            const startIndex = (page - 1) * perPage;
            const endIndex = page * perPage;
            const total = questions.length;

            // Create data for the current page
            const data = questions.slice(startIndex, endIndex);

            new SuccessResponse({ message: "Get Questions Reference successfully", req });
            return res.status(200).json({ items: data, page, perPage, total });
        } catch (error) {
            return handleErrorResponse(error, req, res);
        }
    },

    // Method: GET
    // Path: /question/all
    getAllQuestions: async (req, res) => {
        try {
            const questions = await Question.find().populate('quiz', 'title');
            if (!questions || questions.length === 0) {
                throw new NotFound({ message: 'No questions found', req }, 'info');
            }

            new SuccessResponse({ message: "Get all questions successfully", req });
            return res.status(200).json(questions);
        } catch (error) {
            return handleErrorResponse(error, req, res);
        }
    },

    // Method: GET
    // Path: /question/many
    getManyQuestions: async (req, res) => {
        try {
            console.log('getManyQuestions - req.query:', req.query); 
            
            let questionIds = req.query.ids || req.query['ids[]'];
            
            console.log('Raw questionIds:', questionIds); 
            
            if (Array.isArray(questionIds)) {
                console.log('Question IDs received as array:', questionIds);
            } else if (typeof questionIds === 'string') {
                questionIds = questionIds.includes(',') ? questionIds.split(',') : [questionIds];
                console.log('Question IDs converted from string:', questionIds);
            } else {
                questionIds = [];
            }
            
            if (!questionIds || questionIds.length === 0) {
                throw new BadRequest({ message: 'No question IDs provided', req }, 'info');
            }
            
            console.log('Final processed questionIds:', questionIds); 

            const questions = await Question.find({ _id: { $in: questionIds } });
            if (!questions || questions.length === 0) {
                throw new NotFound({ message: 'No questions found', req }, 'info');
            }

            new SuccessResponse({ message: "Get many questions successfully", req });
            return res.status(200).json({ items: questions });
        } catch (error) {
            return handleErrorResponse(error, req, res);
        }
    },

    // Method: GET
    // Path: /question/:id
    getQuestionById: async (req, res) => {
        try {
            const questionId = req.params.id;
            const question = await Question.findById(questionId);
            if (!question) {
                throw new NotFound({ message: 'Question not found', req }, 'info');
            }

            new SuccessResponse({ message: "Get question by ID successfully", req });
            return res.status(200).json(question);
        } catch (error) {
            return handleErrorResponse(error, req, res);
        }
    },

    // Method: PUT
    // Path: /question/edit/:id
    updateQuestionById: async (req, res) => {
        try {
            const questionId = req.params.id;
            const updateFields = req.body;

            const question = await Question.findOneAndUpdate(
                { _id: questionId },
                { $set: updateFields },
                { new: true }
            );
            if (!question) {
                throw new NotFound({ message: 'Question not found', req }, 'info');
            }

            await Quiz.updateMany(
                { question: questionId },
                { $pull: { question: questionId } }
            );

            if (updateFields.quiz) {
                await Quiz.findOneAndUpdate(
                    { _id: updateFields.quiz },
                    { $push: { question: questionId } }
                );
            }

            new SuccessResponse({ message: "Question updated successfully", req });
            return res.status(200).json(question);
        } catch (error) {
            return handleErrorResponse(error, req, res);
        }
    },

    // Method: DELETE
    // Path: /question/delete/:id
    deleteQuestionById: async (req, res) => {
        try {
            const questionId = req.params.id;
            const question = await Question.findByIdAndDelete(questionId);
            if (!question) {
                throw new NotFound({ message: 'Question not found', req }, 'info');
            }

            await Quiz.updateMany(
                { question: questionId },
                { $pull: { question: questionId } }
            );

            return new SuccessResponse({ message: "Question deleted successfully", req }).send(res);
        } catch (error) {
            return handleErrorResponse(error, req, res);
        }
    },

    // Method: DELETE
    // Path: /question/deleteMany
    deleteManyQuestions: async (req, res) => {
        try {
            const questionIds = req.body.ids;
            if (!questionIds || questionIds.length === 0) {
                throw new BadRequest({ message: 'No question IDs provided', req }, 'info');
            }
    
            await Quiz.updateMany(
                { question: { $in: questionIds } },
                { $pull: { question: { $in: questionIds } } }
            );
    
            await Question.deleteMany({ _id: { $in: questionIds } });
    
            return new SuccessResponse({ message: "Questions deleted successfully", req }).send(res);
        } catch (error) {
            return handleErrorResponse(error, req, res);
        }
    }
};

export default questionController;

