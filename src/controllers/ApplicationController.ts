import { Response, NextFunction } from 'express';
import { ApplicationService } from '../services/ApplicationService';
import { CreateApplicationRequest } from '../types';
import { AuthenticatedRequest } from '../middlewares/auth';

export class ApplicationController {
  private applicationService: ApplicationService;

  constructor() {
    this.applicationService = new ApplicationService();
  }

  createApplication = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const applicationData: CreateApplicationRequest = req.body;
      const candidateId = req.user!.id;
      
      if (!applicationData.job_id || !applicationData.resume) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: job_id, resume'
        });
        return;
      }

      const application = await this.applicationService.createApplication({
        ...applicationData,
        candidate_id: candidateId
      });
      
      res.status(201).json({
        success: true,
        data: application,
        message: 'Application submitted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  getMyApplications = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const candidateId = req.user!.id;
      const applications = await this.applicationService.getApplicationsByCandidate(candidateId);
      
      res.status(200).json({
        success: true,
        data: applications
      });
    } catch (error) {
      next(error);
    }
  };

  getJobApplications = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const jobId = req.params.jobId;
      const employerId = req.user!.id;
      
      const applications = await this.applicationService.getApplicationsByJob(jobId, employerId);
      
      res.status(200).json({
        success: true,
        data: applications
      });
    } catch (error) {
      next(error);
    }
  };

  updateApplicationStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const applicationId = req.params.id;
      const { status } = req.body;
      const employerId = req.user!.id;
      
      if (!status || !['pending', 'reviewed', 'accepted', 'rejected'].includes(status)) {
        res.status(400).json({
          success: false,
          error: 'Invalid status. Must be: pending, reviewed, accepted, or rejected'
        });
        return;
      }

      const updatedApplication = await this.applicationService.updateApplicationStatus(
        applicationId,
        employerId,
        status
      );
      
      if (!updatedApplication) {
        res.status(404).json({
          success: false,
          error: 'Application not found or you do not have permission to update it'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedApplication,
        message: 'Application status updated successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  getApplication = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const applicationId = req.params.id;
      const userId = req.user!.id;
      const userRole = req.user!.role;
      
      const application = await this.applicationService.getApplicationById(applicationId, userId, userRole);
      
      if (!application) {
        res.status(404).json({
          success: false,
          error: 'Application not found or you do not have permission to view it'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: application
      });
    } catch (error) {
      next(error);
    }
  };
}