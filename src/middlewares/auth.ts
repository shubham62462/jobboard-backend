// src/middlewares/auth.ts - JWT Authentication Middleware
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { JwtPayload, User } from '../types';
import { UserRepository } from '../repositories/UserRepository';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export class AuthMiddleware {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  public authenticate = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          error: 'Access token is required'
        });
        return;
      }

      const token = authHeader.substring(7);
      
      try {
        const decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
        
        // Get fresh user data from database
        const user = await this.userRepository.findById(decoded.userId);
        
        if (!user) {
          res.status(401).json({
            success: false,
            error: 'User not found'
          });
          return;
        }

        req.user = user;
        next();
      } catch (jwtError) {
        res.status(401).json({
          success: false,
          error: 'Invalid or expired token'
        });
      }
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  public requireRole = (roles: string | string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const allowedRoles = Array.isArray(roles) ? roles : [roles];
      
      if (!allowedRoles.includes(req.user.role)) {
        res.status(403).json({
          success: false,
          error: 'Insufficient permissions'
        });
        return;
      }

      next();
    };
  };

  public optionalAuth = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        next();
        return;
      }

      const token = authHeader.substring(7);
      
      try {
        const decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
        const user = await this.userRepository.findById(decoded.userId);
        
        if (user) {
          req.user = user;
        }
      } catch (error) {
        // Token invalid, but continue without user
        console.log('Optional auth failed, continuing without user');
      }

      next();
    } catch (error) {
      console.error('Optional auth middleware error:', error);
      next();
    }
  };
}