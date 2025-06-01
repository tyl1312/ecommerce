import { InternalServerError } from "../core/error.response.js";

export const handleErrorResponse = (error, req, res) => {
    if (!error.statusCode || error.statusCode === 500) {
        error = new InternalServerError({ message: error.message, req });
    }
    return res.status(error.statusCode).json({
        message: error.message,
    });
}