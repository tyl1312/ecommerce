import logger from "../logger/logger.js";

/**
 * The SuccessResponse class is a custom success class that extends the built-in Error class.
 * It also logs the success message to the console using the logger module.
 */

class SuccessResponse extends Error {
    constructor({ message, statusCode = 200, req }, logLevel = 'info') {
        super(message);
        this.statusCode = statusCode;
        this.req = req;
        this.logLevel = logLevel;

        const urlRequest = this.req.headers.referer || '-'
        const ip = this.req.headers['x-forwarded-for'] || this.req.connection.remoteAddress;
        // Log the success message including IP, method, URL, status code, and message
        const logMessage = `${ip} - - "${this.req.method} ${this.req.originalUrl} HTTP/${this.req.httpVersion}" ${this.statusCode} - "${urlRequest}" "${this.req.headers['user-agent']}" "${this.message}"`;
        logger[this.logLevel](logMessage);
    }

    send(res) {
        res.status(this.statusCode).json({
            message: this.message,
        });
    }
}

class Created extends SuccessResponse {
    constructor({ message, req }, logLevel = 'info') {
        super({ message, statusCode: 201, req }, logLevel);
    }
}

export { SuccessResponse, Created };