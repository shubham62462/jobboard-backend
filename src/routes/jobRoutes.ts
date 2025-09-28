import { Router } from 'express';
import { JobController } from '../controllers/JobController';
import { AuthMiddleware } from '../middlewares/auth';

const router = Router();
const jobController = new JobController();
const authMiddleware = new AuthMiddleware();

/**
 * @route GET /api/v1/jobs
 * @desc Get all active jobs (with pagination and filters)
 * @access Public
 */
router.get('/', jobController.getJobs);

/**
 * @route GET /api/v1/jobs/:id
 * @desc Get job by ID
 * @access Public
 */
router.get('/:id', jobController.getJobById);

/**
 * @route POST /api/v1/jobs
 * @desc Create new job (employers only)
 * @access Private - Employers only
 */
router.post('/', 
  authMiddleware.authenticate, 
  authMiddleware.requireRole('employer'),
  jobController.createJob
);

/**
 * @route PUT /api/v1/jobs/:id
 * @desc Update job (employers only, own jobs)
 * @access Private - Employers only
 */
router.put('/:id',
  authMiddleware.authenticate,
  authMiddleware.requireRole('employer'),
  jobController.updateJob
);

/**
 * @route DELETE /api/v1/jobs/:id
 * @desc Delete job (employers only, own jobs)
 * @access Private - Employers only
 */
router.delete('/:id',
  authMiddleware.authenticate,
  authMiddleware.requireRole('employer'),
  jobController.deleteJob
);

/**
 * @route GET /api/v1/jobs/employer/my-jobs
 * @desc Get jobs posted by current employer
 * @access Private - Employers only
 */
router.get('/employer/my-jobs',
  authMiddleware.authenticate,
  authMiddleware.requireRole('employer'),
  jobController.getMyJobs
);

export { router as jobRoutes };
