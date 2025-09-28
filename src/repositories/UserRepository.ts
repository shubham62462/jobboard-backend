import { db } from '../config/database';
import { User, CreateUserRequest } from '../types';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export class UserRepository {
  
  async findById(id: string): Promise<User | null> {
    try {
      const { data, error } = await db
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        return null;
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = data;
      return userWithoutPassword as User;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      return null;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await db
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !data) {
        return null;
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = data;
      return userWithoutPassword as User;
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  }

  async create(userData: CreateUserRequest): Promise<User> {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const userId = uuidv4();

      const { data: user, error } = await db
        .from('users')
        .insert({
          id: userId,
          email: userData.email,
          password: hashedPassword,
          role: userData.role,
          first_name: userData.first_name,
          last_name: userData.last_name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single();

      if (error) {
        throw new Error(`Failed to create user: ${error.message}`);
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    try {
      const { data, error } = await db
        .from('users')
        .select('password')
        .eq('id', user.id)
        .single();

      if (error || !data) {
        return false;
      }

      return await bcrypt.compare(password, data.password);
    } catch (error) {
      console.error('Error validating password:', error);
      return false;
    }
  }

  async update(id: string, updates: Partial<User>): Promise<User | null> {
    try {
      const { data, error } = await db
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        throw new Error(`Failed to update user: ${error.message}`);
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = data;
      return userWithoutPassword as User;
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await db
        .from('users')
        .delete()
        .eq('id', id);

      return !error;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }
}