import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const protect = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string; email: string };
      req.user = { id: decoded.id, email: decoded.email };
      return next();
    } catch (error) {
      res.status(401);
      return next(new Error('Not authorized, token failed validation'));
    }
  }

  if (!token) {
    res.status(401);
    return next(new Error('Not authorized, no token provided'));
  }
};
