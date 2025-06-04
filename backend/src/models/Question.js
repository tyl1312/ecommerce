import { Schema, model } from "mongoose";

const questionSchema = new Schema({
    question: {
        type: String,
        required: true,
        trim: true,
    },
    correctOption: {
        type: String,
        required: true,
        trim: true,
    },
    incorrectOptions: [
        {
            type: String,
            required: true,
            trim: true,
        }
    ],
    quiz: {
        type: Schema.Types.ObjectId,
        ref: 'Quiz',
    },
});

const Question = model("Question", questionSchema);
export default Question;
