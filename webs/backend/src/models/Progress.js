import { Schema, model } from 'mongoose';
import User from './User.js';

const progressSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    completedQuizzes: [
        {
          quizId: {
            type: Schema.Types.ObjectId,
            ref: 'Quiz',
            required: true,
          },
          score: {
            type: Number,
            min: 0,
            max: 10,
            required: true,
            validate: {
              validator: Number.isFinite,
              message: '{VALUE} is not an integer value.',
            },
          },
        },
    ],
    totalScore: {
        type: Number,
        default: 0,
    },
    totalCompletedQuizzes: {
        type: Number,
        default: 0,
    },
});

progressSchema.pre('save', async function (next) {
  if (this.isModified('totalScore') || this.isModified('totalCompletedQuizzes')) {
    try {
      const user = await User.findById(this.user);
      if (!user) {
        throw new Error('User not found');
      }
      user.experience = this.totalScore;
      await user.save();
    } catch (error) {
      console.error('Error updating users experience:', error);
    }
  }
  next();
});

const Progress = model('Progress', progressSchema);
export default Progress;