// src/config/env.ts - Environment Configuration
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface Config {
  NODE_ENV: string;
  PORT: number;
  
  // Supabase
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
  SUPABASE_ANON_KEY: string;
  
  // JWT
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  
  // Google Cloud AI
  GOOGLE_CLOUD_PROJECT_ID: string;
  GOOGLE_CLOUD_LOCATION: string;
  VERTEX_AI_MODEL: string;
  
  // API
  API_VERSION: string;
  ALLOWED_ORIGINS: string[];
}

const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_KEY',
  'JWT_SECRET'
];

// Validate required environment variables
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

export const config: Config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  
  // Supabase
  SUPABASE_URL: process.env.SUPABASE_URL!,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY!,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
  // Google Cloud AI
  GOOGLE_CLOUD_PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT_ID || '',
  GOOGLE_CLOUD_LOCATION: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
  VERTEX_AI_MODEL: process.env.VERTEX_AI_MODEL || 'gemini-pro',
  
  // API
  API_VERSION: process.env.API_VERSION || 'v1',
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173']
};

// Log configuration (without sensitive data)
console.log('🔧 Server Configuration:', {
  NODE_ENV: config.NODE_ENV,
  PORT: config.PORT,
  API_VERSION: config.API_VERSION,
  SUPABASE_URL: config.SUPABASE_URL ? '✅ Set' : '❌ Missing',
  JWT_SECRET: config.JWT_SECRET ? '✅ Set' : '❌ Missing',
  GOOGLE_CLOUD_PROJECT_ID: config.GOOGLE_CLOUD_PROJECT_ID || 'Not set (AI disabled)',
  ALLOWED_ORIGINS: config.ALLOWED_ORIGINS
});