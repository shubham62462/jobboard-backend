import { JobRepository } from '../repositories/JobRepository';
import { Job, CreateJobRequest, QueryOptions, PaginatedResponse } from '../types';

export class JobService {
  private jobRepository: JobRepository;

  constructor() {
    this.jobRepository = new JobRepository();
  }

  async getJobs(options: QueryOptions): Promise<PaginatedResponse<Job>> {
    return await this.jobRepository.findAll(options);
  }

  async getJobById(jobId: string): Promise<Job | null> {
    return await this.jobRepository.findById(jobId);
  }

  async createJob(jobData: CreateJobRequest & { employer_id: string }): Promise<Job> {
    return await this.jobRepository.create(jobData);
  }

  async updateJob(jobId: string, employerId: string, updateData: Partial<Job>): Promise<Job | null> {
    // First check if the job belongs to the employer
    const job = await this.jobRepository.findById(jobId);
    if (!job || job.employer_id !== employerId) {
      return null;
    }

    return await this.jobRepository.update(jobId, updateData);
  }

  async deleteJob(jobId: string, employerId: string): Promise<boolean> {
    // First check if the job belongs to the employer
    const job = await this.jobRepository.findById(jobId);
    if (!job || job.employer_id !== employerId) {
      return false;
    }

    return await this.jobRepository.delete(jobId);
  }

  async getJobsByEmployer(employerId: string, options: QueryOptions): Promise<PaginatedResponse<Job>> {
    return await this.jobRepository.findByEmployer(employerId, options);
  }
}