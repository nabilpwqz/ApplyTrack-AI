import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import User from '../models/User';

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

export const isAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401);
      return next(new Error('Not authorized'));
    }

    const user = await User.findById(req.user.id);

    if (!user || user.role !== 'ADMIN') {
      res.status(403);
      return next(new Error('Access denied. Admin privileges required.'));
    }

    return next();
  } catch (error) {
    next(error);
  }
};