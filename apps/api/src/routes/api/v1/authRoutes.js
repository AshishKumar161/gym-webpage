import express from 'express';
import { body } from 'express-validator';
import {
  register,
  verifyOTP,
  login,
  refreshToken,
  logout,
  logoutAll,
  getMe,
  changePassword,
  forgotPassword,
  resetPassword,
  getSessions,
  revokeSession
} from '../../../controllers/authController.js';
import { protect } from '../../../middlewares/authMiddleware.js';
import { authLimiter } from '../../../middlewares/rateLimiter.js';
import { validate } from '../../../middlewares/validateMiddleware.js';

const router = express.Router();

// Apply auth rate limiter to all auth routes
router.use(authLimiter);

// Password strength validator rule
const passwordStrengthRule = body('password')
  .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
  .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
  .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
  .matches(/\d/).withMessage('Password must contain at least one number');

// ─── Public Auth Routes ─────────────────────────────────────────────────────────

router.post(
  '/register',
  validate([
    body('name').notEmpty().trim().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    passwordStrengthRule
  ]),
  register
);

router.post(
  '/login',
  validate([
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required')
  ]),
  login
);

// Support both /refresh and /refresh-token
router.post('/refresh', refreshToken);
router.post('/refresh-token', refreshToken);

// Email / OTP Verification
router.post(
  '/verify-email',
  validate([
    body('email').isEmail().withMessage('Valid email required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
  ]),
  verifyOTP
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
  '/forgot-password',
  validate([body('email').isEmail().withMessage('Valid email required')]),
  forgotPassword
);

router.post(
  '/reset-password',
  validate([
    body('token').notEmpty().withMessage('Reset token required'),
    body('newPassword')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
      .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
      .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
      .matches(/\d/).withMessage('Password must contain at least one number')
  ]),
  resetPassword
);

// ─── Protected Auth Routes ──────────────────────────────────────────────────────

router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.post('/logout-all', protect, logoutAll);

router.post(
  '/change-password',
  protect,
  validate([
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 }).withMessage('New password must be at least 8 characters long')
      .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
      .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
      .matches(/\d/).withMessage('Password must contain at least one number')
  ]),
  changePassword
);

router.get('/sessions', protect, getSessions);
router.delete('/sessions/:id', protect, revokeSession);

export default router;
