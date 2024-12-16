import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';

export const verifyToken = (req, res, next) => {
    const token = req.cookies.access_token;

    if (!token) {
        throw new ApiError(403, 'You are not authenticated!');
    };

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            throw new ApiError(403, 'Token is not valid!');
        };

        req.user = user;
        next();
    });


}