import Progress from '../models/Progress.js';
import { SuccessResponse } from '../core/success.response.js';
import { handleErrorResponse } from '../helper/handleErrorResponse.js';
import { BadRequest, NotFound } from '../core/error.response.js';

const progressController = {
    // Method: GET
    // Path: /progress/
    getProgress: async (req, res) => {
        try {
            let progress = await Progress.findOne({ user: req.user._id }).populate('user', 'username');
            
            // Create progress if it doesn't exist
            if (!progress) {
                progress = new Progress({
                    user: req.user._id,
                    completedQuizzes: [],
                    totalScore: 0,
                    totalCompletedQuizzes: 0
                });
                await progress.save();
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
            const userId = req.user?.id || req.user?._id;
            const { quizId, score } = req.body;

            console.log('Update progress request:', { 
                userId, 
                quizId, 
                score,
                fullUser: req.user
            });

            if (!userId) {
                throw new BadRequest({ message: 'User authentication required', req });
            }

            if (!quizId || score === undefined || score === null) {
                throw new BadRequest({ message: 'QuizId and score are required', req });
            }

            let progress = await Progress.findOne({ user: userId });
            
            if (!progress) {
                progress = new Progress({
                    user: userId,
                    completedQuizzes: [],
                    totalScore: 0,
                    totalCompletedQuizzes: 0
                });
            }

            const minScore = 8;
            if (score < minScore) {
                throw new BadRequest({ message: `Score must be at least ${minScore}`, req });
            }

            // Check if the quiz is already completed
            const existingQuizIndex = progress.completedQuizzes.findIndex(
                quiz => quiz.quizId.toString() === quizId.toString()
            );

            if (existingQuizIndex !== -1) {
                // Update existing quiz score if new score is higher
                const existingScore = progress.completedQuizzes[existingQuizIndex].score;
                if (score > existingScore) {
                    progress.completedQuizzes[existingQuizIndex].score = score;
                } else {
                    return new SuccessResponse({ 
                        message: 'New score is not higher than existing score, no update made', 
                        req 
                    }).send(res);
                }
            } else {
                // Add new completed quiz
                progress.completedQuizzes.push({ quizId, score });
            }

            // Update total score and total completed quizzes
            progress.totalScore = progress.completedQuizzes.reduce((total, quiz) => total + quiz.score, 0);
            progress.totalCompletedQuizzes = progress.completedQuizzes.length;

            await progress.save();

            return new SuccessResponse({ 
                message: 'Progress updated successfully', 
                req 
            }).send(res);
        } catch (error) {
            return handleErrorResponse(error, req, res);
        }
    }
};

export default progressController;