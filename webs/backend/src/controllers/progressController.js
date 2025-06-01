import Progress from '../models/Progress.js';
import { SuccessResponse } from '../core/success.response.js';
import { handleErrorResponse } from '../helper/handleErrorResponse.js';
import { BadRequest, NotFound } from '../core/error.response.js';

const progressController = {

    // Method: GET
    // Path: /progress/
    getProgress: async (req, res) => {
        try {
            const progress = await Progress.findOne({ user: req.user._id }).populate('user', 'username');
            if (!progress) {
                throw new NotFound({ message: 'Progress not found', req }, 'info');
            }
            new SuccessResponse({ progress, req });
            return res.status(200).json(progress);
        } catch (error) {
            return handleErrorResponse(error, req, res);
        }
    },

    // Method: PUT
    // Path: /progress/update
    updateProgress: async (req, res) => {
        try {
            const userId = req.user._id;
            const { quizId, score } = req.body;

            const progress = await Progress.findOne({ user: userId });
            if (!progress) {
                throw new NotFound({ message: 'Progress not found', req }, 'info');
            }

            const minScore = 8;
            if (score < minScore) {
                throw new BadRequest({ message: `Score must be at least ${minScore}`, req });
            }

            // Check if the quiz is already completed
            const existingQuiz = progress.completedQuizzes.find(quiz => quiz.quizId.equals(quizId));
            // console.log(existingQuiz)
            if (existingQuiz) {
                if (existingQuiz.score < score) {
                    existingQuiz.score = score; 
                } else {
                    return new SuccessResponse({ message: 'New score is not higher than existing score, no update made', req }).send(res);
                }
            } else {
                progress.completedQuizzes.push({ quizId, score });
            }

            // Update total score and total completed quizzes
            progress.totalScore = progress.completedQuizzes.reduce((total, quiz) => total + quiz.score, 0);
            progress.totalCompletedQuizzes = progress.completedQuizzes.length;

            await progress.save();

            return new SuccessResponse({ message: 'Progress updated successfully', req }).send(res);
        } catch (error) {
            return handleErrorResponse(error, req, res);
        }
    },

}

export default progressController;