import { Router } from 'express';
import { authRoutes } from './authRoutes';
import { jobRoutes } from './jobRoutes';
import { applicationRoutes } from './applicationRoutes';

const router = Router();

// API Info endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Job Board API',
    version: '1.0.0',
    endpoints: {
      auth: '/auth',
      jobs: '/jobs',
      applications: '/applications',
      profiles: '/profiles'
    },
    documentation: 'https://your-api-docs.com'
  });
});

// Route modules
router.use('/auth', authRoutes);
router.use('/jobs', jobRoutes);
router.use('/applications', applicationRoutes);

export { router as apiRoutes };