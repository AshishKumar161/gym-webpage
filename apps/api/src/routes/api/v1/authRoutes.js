import express from 'express';
import { body } from 'express-validator';
import {
  register,
  verifyOTP,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword
} from '../../../controllers/authController.js';
import { protect } from '../../../middlewares/authMiddleware.js';
import { authLimiter } from '../../../middlewares/rateLimiter.js';
import { validate } from '../../../middlewares/validateMiddleware.js';

const router = express.Router();

// Apply auth rate limiter to all auth routes
router.use(authLimiter);

router.post(
  '/register',
  validate([
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
  ]),
  register
);

router.post(
  '/verify-otp',
  validate([
    body('email').isEmail().withMessage('Valid email required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
  ]),
  verifyOTP
);

router.post(
  '/login',
  validate([
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required')
  ]),
  login
);

router.post('/refresh-token', refreshToken);
router.post('/logout', protect, logout);

router.post(
  '/forgot-password',
  validate([body('email').isEmail().withMessage('Valid email required')]),
  forgotPassword
);

router.post(
  '/reset-password',
  validate([
    body('token').notEmpty().withMessage('Token required'),
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
  ]),
  resetPassword
);

export default router;
