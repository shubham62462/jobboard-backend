// src/services/AuthService.ts - UPDATED for single user table
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/UserRepository';
import { User, CreateUserRequest, LoginRequest, AuthResponse, JwtPayload } from '../types';
import { config } from '../config/env';

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(userData: CreateUserRequest): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Create user (includes profile data in same table)
    const user = await this.userRepository.create(userData);
    
    // Generate JWT token
    const token = this.generateToken(user);

    return {
      user,
      token
      // No separate profile needed!
    };
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    // Find user by email
    const user = await this.userRepository.findByEmail(credentials.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Validate password
    const isValidPassword = await this.userRepository.validatePassword(user, credentials.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT token
    const token = this.generateToken(user);

    return {
      user,
      token
      // No separate profile needed!
    };
  }

  generateToken(user: User): string {
    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    return jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRES_IN
    });
  }

  async getUserWithProfile(userId: string): Promise<{ user: User }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      user
      // No separate profile - all data is in user object!
    };
  }

  async validateToken(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
      return await this.userRepository.findById(decoded.userId);
    } catch (error) {
      return null;
    }
  }

  async updateUser(userId: string, updateData: Partial<User>): Promise<User> {
    const updatedUser = await this.userRepository.update(userId, updateData);
    
    if (!updatedUser) {
      throw new Error('Failed to update user');
    }

    return updatedUser;
  }
}

export { AuthService as default };