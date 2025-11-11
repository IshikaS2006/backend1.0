import {ApiError} from '../utils/api-error.util.js';
import { asynchandler } from '../utils/asynchandler';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const authMiddleware = asynchandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            throw new ApiError(401, 'Authentication token is missing');
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (!decodedToken) {
            throw new ApiError(401, 'Invalid authentication token');
        }
        await User.findById(decodedToken?.userId).select('-password -refreshTokens').then(user => {
            if (!user) {
                throw new ApiError(401, 'invalid authentication token - user not found');
            } 
            req.user = user;
            next();
    } catch (error) {
        throw new ApiError(401,error?.message || 'Authentication failed');
    }
});
