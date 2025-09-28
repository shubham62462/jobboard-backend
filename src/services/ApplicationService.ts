import { ApplicationRepository } from '../repositories/ApplicationRepository';
import { JobRepository } from '../repositories/JobRepository';
import { Application, CreateApplicationRequest, Job } from '../types';
import { AIService } from './AIService';

export class ApplicationService {
  private applicationRepository: ApplicationRepository;
  private jobRepository: JobRepository;
  private aiService: AIService;

  constructor() {
    this.applicationRepository = new ApplicationRepository();
    this.jobRepository = new JobRepository();
    this.aiService = new AIService();
  }

  async createApplication(applicationData: CreateApplicationRequest & { candidate_id: string }): Promise<Application> {
    // Check if user already applied to this job
    const existingApplication = await this.applicationRepository.findByJobAndCandidate(
      applicationData.job_id,
      applicationData.candidate_id
    );

    if (existingApplication) {
      throw new Error('You have already applied to this job');
    }

    // Get job details for AI analysis
    const job = await this.jobRepository.findById(applicationData.job_id);
    if (!job) {
      throw new Error('Job not found');
    }

    // Create application
    const application = await this.applicationRepository.create(applicationData);

    // Run AI analysis 
    try {
      await this.analyzeApplicationWithAI(application, job)
    } catch(err) {
      console.error('AI analysis failed:', err);
    }

    return application;
  }

  private async analyzeApplicationWithAI(application: Application, job: Job): Promise<void> {
    try {
      console.log("Inside analyzeApplicationWithAI")
      const analysis = await this.aiService.analyzeCandidate(application.resume, application.cover_letter, job);
      console.log("Analysis", analysis)
      // Update application with AI results
      await this.applicationRepository.update(application.id, {
        ai_score: analysis.score,
        ai_analysis: analysis
      });
    } catch (error) {
      console.error('AI analysis error:', error);
    }
  }

  async getApplicationsByCandidate(candidateId: string): Promise<Application[]> {
    return await this.applicationRepository.findByCandidate(candidateId);
  }

  async getApplicationsByJob(jobId: string, employerId: string): Promise<Application[]> {
    // Verify job belongs to employer
    const job = await this.jobRepository.findById(jobId);
    if (!job || job.employer_id !== employerId) {
      throw new Error('Job not found or access denied');
    }

    return await this.applicationRepository.findByJob(jobId);
  }

  async updateApplicationStatus(
    applicationId: string,
    employerId: string,
    status: any
  ): Promise<Application | null> {
    // Get application with job info
    const application = await this.applicationRepository.findByIdWithJob(applicationId);
    if (!application || !application.job || application.job.employer_id !== employerId) {
      return null;
    }

    return await this.applicationRepository.update(applicationId, { status });
  }

  async getApplicationById(
    applicationId: string,
    userId: string,
    userRole: string
  ): Promise<Application | null> {
    const application = await this.applicationRepository.findByIdWithJob(applicationId);
    
    if (!application) {
      return null;
    }

    // Check permissions
    if (userRole === 'candidate' && application.candidate_id !== userId) {
      return null;
    }

    if (userRole === 'employer' && application.job?.employer_id !== userId) {
      return null;
    }

    return application;
  }
}