// src/controllers/AuthController.ts - UPDATED for simplified user table
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { CreateUserRequest, LoginRequest } from '../types';
import { AuthenticatedRequest } from '../middlewares/auth';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: CreateUserRequest = req.body;
      
      // Basic validation
      if (!userData.email || !userData.password || !userData.first_name || !userData.last_name || !userData.role) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: email, password, first_name, last_name, role'
        });
        return;
      }

      const result = await this.authService.register(userData);
      
      res.status(201).json({
        success: true,
        data: result,
        message: 'User registered successfully'
      });
    } catch (error: any) {
      if (error.message === 'User already exists with this email') {
        res.status(409).json({
          success: false,
          error: error.message
        });
        return;
      }
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const credentials: LoginRequest = req.body;
      
      if (!credentials.email || !credentials.password) {
        res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
        return;
      }

      const result = await this.authService.login(credentials);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Login successful'
      });
    } catch (error: any) {
      if (error.message === 'Invalid credentials') {
        res.status(401).json({
          success: false,
          error: error.message
        });
        return;
      }
      next(error);
    }
  };

  getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const userWithProfile = await this.authService.getUserWithProfile(userId);
      
      res.status(200).json({
        success: true,
        data: userWithProfile
      });
    } catch (error) {
      next(error);
    }
  };

  updateMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const updateData = req.body;
      
      // Remove sensitive fields that shouldn't be updated via this endpoint
      delete updateData.id;
      delete updateData.email;
      delete updateData.password;
      delete updateData.role;
      delete updateData.created_at;
      delete updateData.updated_at;
      
      const updatedUser = await this.authService.updateUser(userId, updateData);
      
      res.status(200).json({
        success: true,
        data: { user: updatedUser },
        message: 'Profile updated successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user!;
      const newToken = this.authService.generateToken(user);
      
      res.status(200).json({
        success: true,
        data: { token: newToken },
        message: 'Token refreshed successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // In a more sophisticated setup, you might blacklist the token
      res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}

// src/controllers/UserController.ts - NEW controller for user profile operations
import { Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { UpdateUserRequest } from '../types';
import { AuthenticatedRequest } from '../middlewares/auth';

export class UserController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  getProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const userWithProfile = await this.authService.getUserWithProfile(userId);
      
      res.status(200).json({
        success: true,
        data: userWithProfile
      });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const updateData: UpdateUserRequest = req.body;
      
      const updatedUser = await this.authService.updateUser(userId, updateData);
      
      res.status(200).json({
        success: true,
        data: { user: updatedUser },
        message: 'Profile updated successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  getPublicProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.id;
      const userWithProfile = await this.authService.getUserWithProfile(userId);
      
      // Return only public information
      const publicProfile = {
        id: userWithProfile.user.id,
        first_name: userWithProfile.user.first_name,
        last_name: userWithProfile.user.last_name,
        bio: userWithProfile.user.bio,
        skills: userWithProfile.user.skills,
        experience: userWithProfile.user.experience,
        education: userWithProfile.user.education
      };
      
      res.status(200).json({
        success: true,
        data: { user: publicProfile }
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'User not found') {
        res.status(404).json({
          success: false,
          error: 'Profile not found'
        });
        return;
      }
      next(error);
    }
  };
}