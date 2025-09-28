// src/config/database.ts - Supabase Configuration
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './env';

class DatabaseConnection {
  private static instance: DatabaseConnection;
  private supabase: SupabaseClient;

  private constructor() {
    this.supabase = createClient(
      config.SUPABASE_URL,
      config.SUPABASE_SERVICE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        db: {
          schema: 'public'
        }
      }
    );
  }

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public getClient(): SupabaseClient {
    return this.supabase;
  }

  public async testConnection(): Promise<boolean> {
    try {
      const { error } = await this.supabase.from('users').select('count').limit(1);
      if (error && !error.message.includes('relation "users" does not exist')) {
        console.error('Database connection test failed:', error);
        return false;
      }
      console.log('✅ Database connection successful');
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      return false;
    }
  }
}

export const db = DatabaseConnection.getInstance().getClient();
export default DatabaseConnection;