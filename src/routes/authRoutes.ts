import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { AuthMiddleware } from '../middlewares/auth';

const router = Router();
const authController = new AuthController();
const authMiddleware = new AuthMiddleware();

/**
 * @route POST /api/v1/auth/register
 * @desc Register new user
 * @access Public
 */
router.post('/register', authController.register);

/**
 * @route POST /api/v1/auth/login
 * @desc Login user
 * @access Public
 */
router.post('/login', authController.login);

/**
 * @route GET /api/v1/auth/me
 * @desc Get current user profile
 * @access Private
 */
router.get('/me', authMiddleware.authenticate, authController.getMe);

/**
 * @route POST /api/v1/auth/refresh
 * @desc Refresh JWT token
 * @access Private
 */
router.post('/refresh', authMiddleware.authenticate, authController.refresh);

/**
 * @route POST /api/v1/auth/logout
 * @desc Logout user
 * @access Private
 */
router.post('/logout', authMiddleware.authenticate, authController.logout);

export { router as authRoutes };
