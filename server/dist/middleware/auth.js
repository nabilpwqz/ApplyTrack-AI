import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
export const protect = (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, env.JWT_SECRET);
            req.user = { id: decoded.id, email: decoded.email };
            return next();
        }
        catch (error) {
            res.status(401);
            return next(new Error('Not authorized, token failed validation'));
        }
    }
    if (!token) {
        res.status(401);
        return next(new Error('Not authorized, no token provided'));
    }
};
