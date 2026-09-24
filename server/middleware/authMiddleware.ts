import { Request, Response, NextFunction } from 'express';
import { authService, TokenPayload } from '../services/authService.js';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export const authenticateJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication token required. Please sign in.'
    });
  }

  const token = authHeader.split(' ')[1];
  const payload = authService.verifyToken(token);

  if (!payload) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session token.'
    });
  }

  req.user = payload;
  next();
};

export const requireRole = (roles: Array<'customer' | 'admin' | 'staff'>) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Insufficient permissions for this atelier operation.'
      });
    }

    next();
  };
};

export const requireAdminOrStaff = [authenticateJWT, requireRole(['admin', 'staff'])];
export const requireAdmin = [authenticateJWT, requireRole(['admin'])];
