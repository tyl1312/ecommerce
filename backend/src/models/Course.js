import { Schema, model } from "mongoose";

const courseSchema = new Schema({
    courseTitle: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    estimatedTime: {
        type: Number,
        min: 0,
        validate: {
            validator: Number.isInteger,
            message: '{VALUE} is not an integer value.',
        },
        trim: true,
    },
    image: {
        type: String,
        trim: true,
        default: '',
    },
    quiz: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Quiz',
        },
    ],
    level: {
        type: String,
        required: true,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        default: 'Beginner',
    },
});

const Course = model('Course', courseSchema);
export default Course;