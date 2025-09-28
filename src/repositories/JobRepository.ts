import { db } from '../config/database';
import { Job, CreateJobRequest, QueryOptions, PaginatedResponse } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class JobRepository {
  
  async findAll(options: QueryOptions): Promise<PaginatedResponse<Job>> {
    try {
      const page = options.page || 1;
      const limit = options.limit || 10;
      const offset = (page - 1) * limit;
      
      let query = db
        .from('jobs')
        .select(`
          *,
          employer:users!fk_jobs_employer_id(id, first_name, last_name, bio)
        `)
        .eq('status', 'active');

      // Apply filters
      if (options.filters?.search) {
        query = query.or(`title.ilike.%${options.filters.search}%,description.ilike.%${options.filters.search}%`);
      }

      if (options.filters?.location) {
        query = query.ilike('location', `%${options.filters.location}%`);
      }

      // Apply sorting
      const sortBy = options.sortBy || 'created_at';
      const sortOrder = options.sortOrder || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Get total count
      const { count } = await db
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch jobs: ${error.message}`);
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: data as Job[],
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<Job | null> {
    try {
      const { data, error } = await db
        .from('jobs')
        .select(`
          *,
          employer:users!fk_jobs_employer_id(id, first_name, last_name, bio, email)
        `)
        .eq('id', id)
        .single();

      if (error || !data) {
        return null;
      }

      return data as Job;
    } catch (error) {
      console.error('Error finding job by ID:', error);
      return null;
    }
  }

  async create(jobData: CreateJobRequest & { employer_id: string }): Promise<Job> {
    try {
      const jobId = uuidv4();
      
      const { data, error } = await db
        .from('jobs')
        .insert({
          id: jobId,
          ...jobData,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select(`
          *,
          employer:users!fk_jobs_employer_id(id, first_name, last_name, bio, email)
        `)
        .single();

      if (error) {
        throw new Error(`Failed to create job: ${error.message}`);
      }

      return data as Job;
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  }

  async update(id: string, updates: Partial<Job>): Promise<Job | null> {
    try {
      const { data, error } = await db
        .from('jobs')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          employer:users!fk_jobs_employer_id(id, first_name, last_name, bio, email)
        `)
        .single();

      if (error) {
        throw new Error(`Failed to update job: ${error.message}`);
      }

      return data as Job;
    } catch (error) {
      console.error('Error updating job:', error);
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await db
        .from('jobs')
        .delete()
        .eq('id', id);

      return !error;
    } catch (error) {
      console.error('Error deleting job:', error);
      return false;
    }
  }

  async findByEmployer(employerId: string, options: QueryOptions): Promise<PaginatedResponse<Job>> {
  try {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const offset = (page - 1) * limit;
    
    let query = db
      .from('jobs')
      .select(`
        *,
        employer:users!fk_jobs_employer_id(id, first_name, last_name, bio, email)
      `)  // ✅ Changed to use the correct constraint name
      .eq('employer_id', employerId);

    // Apply sorting
    const sortBy = options.sortBy || 'created_at';
    const sortOrder = options.sortOrder || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Get total count
    const { count } = await db
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('employer_id', employerId);

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch employer jobs: ${error.message}`);
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: data as Job[],
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  } catch (error) {
    console.error('Error fetching employer jobs:', error);
    throw error;
  }
}
}
