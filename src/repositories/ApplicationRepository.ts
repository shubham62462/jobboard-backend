// src/repositories/ApplicationRepository.ts - FIXED for single users table
import { db } from '../config/database';
import { Application, CreateApplicationRequest } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class ApplicationRepository {
  
  async create(applicationData: CreateApplicationRequest & { candidate_id: string }): Promise<Application> {
    try {
      const applicationId = uuidv4();
      
      const { data, error } = await db
        .from('applications')
        .insert({
          id: applicationId,
          ...applicationData,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select(`
          *,
          job:jobs(*),
          candidate:users!fk_applications_candidate_id(id, first_name, last_name, bio, skills, experience, education)
        `)
        .single();

      if (error) {
        throw new Error(`Failed to create application: ${error.message}`);
      }

      return data as Application;
    } catch (error) {
      console.error('Error creating application:', error);
      throw error;
    }
  }

  async findByJobAndCandidate(jobId: string, candidateId: string): Promise<Application | null> {
    try {
      const { data, error } = await db
        .from('applications')
        .select('*')
        .eq('job_id', jobId)
        .eq('candidate_id', candidateId)
        .single();

      if (error || !data) {
        return null;
      }

      return data as Application;
    } catch (error) {
      console.error('Error finding application:', error);
      return null;
    }
  }

  async findByCandidate(candidateId: string): Promise<Application[]> {
    try {
      const { data, error } = await db
        .from('applications')
        .select(`
          *,
          job:jobs(*, employer:users!fk_jobs_employer_id(id, first_name, last_name, email)),
          candidate:users!fk_applications_candidate_id(id, first_name, last_name, bio)
        `)
        .eq('candidate_id', candidateId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch candidate applications: ${error.message}`);
      }

      return data as Application[];
    } catch (error) {
      console.error('Error fetching candidate applications:', error);
      return [];
    }
  }

  async findByJob(jobId: string): Promise<Application[]> {
    try {
      const { data, error } = await db
        .from('applications')
        .select(`
          *,
          job:jobs(*),
          candidate:users!fk_applications_candidate_id(id, first_name, last_name, bio, skills, experience, education, email)
        `)
        .eq('job_id', jobId)
        .order('ai_score', { ascending: false, nullsLast: true });

      if (error) {
        throw new Error(`Failed to fetch job applications: ${error.message}`);
      }

      return data as Application[];
    } catch (error) {
      console.error('Error fetching job applications:', error);
      return [];
    }
  }

  async findByIdWithJob(id: string): Promise<Application | null> {
    try {
      const { data, error } = await db
        .from('applications')
        .select(`
          *,
          job:jobs(*, employer:users!fk_jobs_employer_id(id, first_name, last_name, email)),
          candidate:users!fk_applications_candidate_id(id, first_name, last_name, bio, skills, experience, education)
        `)
        .eq('id', id)
        .single();

      if (error || !data) {
        return null;
      }

      return data as Application;
    } catch (error) {
      console.error('Error finding application by ID:', error);
      return null;
    }
  }

  async update(id: string, updates: Partial<Application>): Promise<Application | null> {
    try {
      const { data, error } = await db
        .from('applications')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          job:jobs(*),
          candidate:users!fk_applications_candidate_id(id, first_name, last_name, bio)
        `)
        .single();

      if (error) {
        throw new Error(`Failed to update application: ${error.message}`);
      }

      return data as Application;
    } catch (error) {
      console.error('Error updating application:', error);
      return null;
    }
  }
}
