import { Response, NextFunction } from 'express';
import { JobService } from '../services/JobService';
import { CreateJobRequest, QueryOptions } from '../types';
import { AuthenticatedRequest } from '../middlewares/auth';

export class JobController {
  private jobService: JobService;

  constructor() {
    this.jobService = new JobService();
  }

  getJobs = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const queryOptions: QueryOptions = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        sortBy: req.query.sortBy as string || 'created_at',
        sortOrder: req.query.sortOrder as 'asc' | 'desc' || 'desc',
        filters: {
          location: req.query.location,
          search: req.query.search
        }
      };

      const result = await this.jobService.getJobs(queryOptions);
      
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  };

  getJobById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const jobId = req.params.id;
      const job = await this.jobService.getJobById(jobId);
      
      if (!job) {
        res.status(404).json({
          success: false,
          error: 'Job not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: job
      });
    } catch (error) {
      next(error);
    }
  };

  createJob = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const jobData: CreateJobRequest = req.body;
      const employerId = req.user!.id;
      
      // Basic validation
      if (!jobData.title || !jobData.description || !jobData.requirements || !jobData.location) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: title, description, requirements, location'
        });
        return;
      }

      const job = await this.jobService.createJob({ ...jobData, employer_id: employerId });
      
      res.status(201).json({
        success: true,
        data: job,
        message: 'Job created successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  updateJob = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const jobId = req.params.id;
      const employerId = req.user!.id;
      const updateData = req.body;
      
      const updatedJob = await this.jobService.updateJob(jobId, employerId, updateData);
      
      if (!updatedJob) {
        res.status(404).json({
          success: false,
          error: 'Job not found or you do not have permission to update it'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedJob,
        message: 'Job updated successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  deleteJob = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const jobId = req.params.id;
      const employerId = req.user!.id;
      
      const success = await this.jobService.deleteJob(jobId, employerId);
      
      if (!success) {
        res.status(404).json({
          success: false,
          error: 'Job not found or you do not have permission to delete it'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Job deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  getMyJobs = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const employerId = req.user!.id;
      const queryOptions: QueryOptions = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        sortBy: req.query.sortBy as string || 'created_at',
        sortOrder: req.query.sortOrder as 'asc' | 'desc' || 'desc'
      };

      const result = await this.jobService.getJobsByEmployer(employerId, queryOptions);
      
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  };
}
