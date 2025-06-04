import Tokens from 'csrf';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { Forbidden } from '../core/error.response.js';
dotenv.config();

const tokens = new Tokens();

const csrfMiddleware = (req, res, next) => {
    const csrfSecret = crypto.randomBytes(32).toString('hex');
    const csrfToken = tokens.create(csrfSecret);
    console.log('New csrfToken', csrfToken);
    console.log('New csrfSecret', csrfSecret);

    res.cookie('csrfSecret', csrfSecret, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * parseInt(process.env.REFRESH_TOKEN_EXPIRY)), // Should match the refresh token expiry
    });

    res.locals.csrfToken = csrfToken;
    res.setHeader('X-CSRF-Token', csrfToken);
    next();
};

export const verifyCsrfToken = async (req, res, next) => {
    const csrfToken = req.headers['x-csrf-token'];
    const csrfSecret = req.cookies['csrfSecret'];

    if (!csrfToken || !csrfSecret || !tokens.verify(csrfSecret, csrfToken)) {
        return new Forbidden({ message: 'Invalid CSRF token', req }).send(res);
    }

    next();
};

export default csrfMiddleware;