import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, env.JWT_SECRET);

      // Add user info to request object
      req.user = {
        id: decoded.id,
        email: decoded.email,
      };

      next();
    } catch (error) {
      console.error('🔓 Auth token validation failed:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed',
        error: 'UNAUTHORIZED',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided',
      error: 'UNAUTHORIZED_NO_TOKEN',
    });
  }
};
export default protect;
