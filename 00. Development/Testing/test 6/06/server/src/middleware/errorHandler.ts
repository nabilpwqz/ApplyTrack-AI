import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: env.NODE_ENV === 'production' ? null : err.stack,
  });
};
