// src/types/index.ts - UPDATED for single user table
export interface User {
  id: string;
  email: string;
  role: 'employer' | 'candidate';
  
  // Profile data (now part of user)
  first_name: string;
  last_name: string;
  phone?: string;
  bio?: string;
  skills?: string[];
  experience?: string;
  education?: string;
  resume_url?: string;
  
  created_at?: string;
  updated_at?: string;
}

// Remove the separate Profile interface - no longer needed!
// export interface Profile { ... } - DELETED

export interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string;
  location: string;
  salary?: string;
  employer_id: string;
  status: 'active' | 'closed' | 'draft';
  created_at: string;
  updated_at: string;
  employer?: User; // Now references User directly, not Profile
}

export interface Application {
  id: string;
  job_id: string;
  candidate_id: string;
  resume: string;
  cover_letter?: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  ai_score?: number;
  ai_analysis?: AIAnalysis;
  created_at: string;
  updated_at: string;
  job?: Job;
  candidate?: User; // Now references User directly, not Profile
}

export interface AIAnalysis {
  score: number;
  strengths: string[];
  concerns: string[];
  explanation: string;
  match_percentage: number;
  recommendation: string;
}

// Request/Response Types
export interface CreateUserRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: 'employer' | 'candidate';
  // Optional profile fields during registration
  phone?: string;
  bio?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  // No separate profile needed anymore!
}

export interface CreateJobRequest {
  title: string;
  description: string;
  requirements: string;
  location: string;
  salary?: string;
}

export interface CreateApplicationRequest {
  job_id: string;
  resume: string;
  cover_letter?: string;
}

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  bio?: string;
  skills?: string[];
  experience?: string;
  education?: string;
  resume_url?: string;
}

// Remove UpdateProfileRequest - use UpdateUserRequest instead

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Database Query Options
export interface QueryOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

// JWT Payload
export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}