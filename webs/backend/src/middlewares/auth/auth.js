import jwt from 'jsonwebtoken';
import User from '../../models/User.js';
import { NotFound, InternalServerError, Unauthorized } from '../../core/error.response.js';
import * as dotenv from 'dotenv';
import { handleErrorResponse } from '../../helper/handleErrorResponse.js';

dotenv.config();

const secret = process.env.ACCESS_TOKEN_SECRET;

const verifyJWT = async (req, res, next) => {
    try {
        const token = await req.cookies?.accessToken || req.headers['authorization']?.replace('Bearer ', '');
        if (!token) {
            throw new Unauthorized({ message: 'You need to login', req }, 'info');
        }
        const decoded = jwt.verify(token, secret);
        // Query user by id in database without password and refreshToken
        const user = await User.findById(decoded._id).select('-password -refreshToken');
        if (!user) {
            throw new NotFound({ message: 'User not found', req }, 'info');
        }
        req.user = user;
        next()   

    } catch (error) {
        return handleErrorResponse(error, req, res);
    }
};

const isAdmin = async (req, res, next) => {
    if (req.user.role !== 'admin') {
        return new Unauthorized({ message: 'You are not authorized', req }).send(res);
    } 
    next();
}

export { verifyJWT, isAdmin }