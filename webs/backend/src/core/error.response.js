import logger from "../logger/logger.js";

/**
  The ErrorResponse class is a custom error class that extends the built-in Error class.
  It also logs the error message to the console using the logger module.
*/
class ErrorResponse extends Error {
    /**
     * Constructs an instance of ErrorResponse.
     * @param {Object} params - An object containing the message, statusCode, and req.
     * @param {string} params.message - The error message.
     * @param {number} [params.statusCode=500] - The HTTP status code.
     * @param {Object} params.req - The request object.
     * @param {string} [logLevel='error'] - The log level (e.g., 'error', 'warn').
     */
    constructor({ message, statusCode = 500, req }, logLevel = 'error') {
        super(message);
        this.statusCode = statusCode;
        this.req = req;
        this.logLevel = logLevel;

        const urlRequest = this.req.headers.referer || '-'
        const ip = this.req.headers['x-forwarded-for'] || this.req.connection.remoteAddress;
        // Log the error message including IP, method, URL, status code, and message
        const logMessage = `${ip} - - "${this.req.method} ${this.req.originalUrl} HTTP/${this.req.httpVersion}" ${this.statusCode} - "${urlRequest}" "${this.req.headers['user-agent']}" "${this.message}"`;
        logger[this.logLevel](logMessage);
    }

    send(res) {
        res.status(this.statusCode).json({
            message: this.message,
        });
    }
}

class BadRequest extends ErrorResponse {
    constructor(error, logLevel = 'warn') {
        super({ ...error, statusCode: 400 }, logLevel);
    }
}

class NotFound extends ErrorResponse {
    constructor(error, logLevel = 'warn') {
        super({ ...error, statusCode: 404 }, logLevel);
    }
}

class Unauthorized extends ErrorResponse {
    constructor(error, logLevel = 'warn') {
        super({ ...error, statusCode: 401 }, logLevel);
    }
}

class Forbidden extends ErrorResponse {
    constructor(error, logLevel = 'warn') {
        super({ ...error, statusCode: 403 }, logLevel);
    }
}

class InternalServerError extends ErrorResponse {
    constructor(error, logLevel = 'error') {
        super({ ...error, statusCode: 500 }, logLevel);
    }
}

class RateLimitError extends ErrorResponse {
    constructor(error, logLevel = 'warn') {
        super({ ...error, statusCode: 429 }, logLevel);
    }
}

export { BadRequest, NotFound, Unauthorized, Forbidden, InternalServerError, RateLimitError };