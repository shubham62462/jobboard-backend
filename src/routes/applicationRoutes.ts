import { Router } from 'express';
import { ApplicationController } from '../controllers/ApplicationController';
import { AuthMiddleware } from '../middlewares/auth';

const router = Router();
const applicationController = new ApplicationController();
const authMiddleware = new AuthMiddleware();

/**
 * @route POST /api/v1/applications
 * @desc Apply for a job (candidates only)
 * @access Private - Candidates only
 */
router.post('/',
  authMiddleware.authenticate,
  authMiddleware.requireRole('candidate'),
  applicationController.createApplication
);

/**
 * @route GET /api/v1/applications/my-applications
 * @desc Get current candidate's applications
 * @access Private - Candidates only
 */
router.get('/my-applications',
  authMiddleware.authenticate,
  authMiddleware.requireRole('candidate'),
  applicationController.getMyApplications
);

/**
 * @route GET /api/v1/applications/job/:jobId
 * @desc Get applications for a specific job (employers only)
 * @access Private - Employers only
 */
router.get('/job/:jobId',
  authMiddleware.authenticate,
  authMiddleware.requireRole('employer'),
  applicationController.getJobApplications
);

/**
 * @route PUT /api/v1/applications/:id/status
 * @desc Update application status (employers only)
 * @access Private - Employers only
 */
router.put('/:id/status',
  authMiddleware.authenticate,
  authMiddleware.requireRole('employer'),
  applicationController.updateApplicationStatus
);

/**
 * @route GET /api/v1/applications/:id
 * @desc Get application details
 * @access Private - Candidates (own) or Employers (for their jobs)
 */
router.get('/:id',
  authMiddleware.authenticate,
  applicationController.getApplication
);

export { router as applicationRoutes };
