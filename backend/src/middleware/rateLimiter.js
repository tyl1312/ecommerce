import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 5, 
    message: {
        error: 'Too many login attempts, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true, 
    legacyHeaders: false, 
    keyGenerator: (req) => `${req.ip}-${req.body.email || req.body.identifier}`,
    handler: (req, res) => {
        res.status(429).json({
            error: 'Too many login attempts, please try again later.',
            retryAfter: '15 minutes'
        });
    }
});

// Rate limit for registration
export const registrationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3, 
    message: {
        error: 'Too many registration attempts, please try again later.',
        retryAfter: '1 hour'
    },
    keyGenerator: (req) => req.ip || req.connection.remoteAddress,
    handler: (req, res) => {
        res.status(429).json({
            error: 'Too many registration attempts, please try again later.',
            retryAfter: '1 hour'
        });
    }
});

// Rate limit for OTP requests
export const otpRequestLimiter = rateLimit({
    windowMs: 45 * 1000, 
    max: 1, 
    keyGenerator: (req) => {
        const email = req.body.email;
        const ip = req.ip || req.connection.remoteAddress;
        return email ? `otp:${email}` : `otp:${ip}`;
    },
    message: {
        error: 'Please wait before requesting another OTP.',
        retryAfter: '1 minute'
    },
    handler: (req, res) => {
        res.status(429).json({
            error: 'Please wait before requesting another OTP.',
            retryAfter: '1 minute'
        });
    }
});

// Rate limit for OTP verification
export const otpVerificationLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5, 
    keyGenerator: (req) => {
        const email = req.body.email;
        const ip = req.ip || req.connection.remoteAddress;
        return email ? `otp_verify:${email}` : `otp_verify:${ip}`;
    },
    skipSuccessfulRequests: true,
    message: {
        error: 'Too many OTP verification attempts, please try again later.',
        retryAfter: '10 minutes'
    },
    handler: (req, res) => {
        res.status(429).json({
            error: 'Too many OTP verification attempts, please try again later.',
            retryAfter: '10 minutes'
        });
    }
});

// Rate limiting for password reset requests
export const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, 
    max: 3,
    keyGenerator: (req) => {
        const email = req.body.email;
        const ip = req.ip || req.connection.remoteAddress;
        return email ? `reset:${email}` : `reset:${ip}`;
    },
    message: {
        error: 'Too many password reset requests, please try again later.',
        retryAfter: '1 hour'
    },
    handler: (req, res) => {
        res.status(429).json({
            error: 'Too many password reset requests, please try again later.',
            retryAfter: '1 hour'
        });
    }
});

// Default export for backwards compatibility
export default {
    loginLimiter,
    registrationLimiter,
    otpRequestLimiter,
    otpVerificationLimiter,
    passwordResetLimiter
};