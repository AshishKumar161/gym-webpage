import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import {
  registerValidator,
  loginValidator,
  changePasswordValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  verifyEmailValidator,
  resendVerificationValidator,
} from '../validators/auth.validator.js';
import rateLimit from 'express-rate-limit';

// Using mock authentication middleware for now
const authenticate = (req: any, res: any, next: any) => {
  // In a real scenario, this would decode the Bearer JWT and set req.user
  req.user = { id: 'mock-uuid-for-testing', roles: ['MEMBER'] }; 
  next();
};

const router = Router();

// Strict rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { status: 'fail', message: 'Too many attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const passwordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { status: 'fail', message: 'Too many password reset attempts. Try again in 1 hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Public Routes ─────────────────────────────────────────
router.post('/register', authLimiter, validateRequest(registerValidator), AuthController.register);
router.post('/login', authLimiter, validateRequest(loginValidator), AuthController.login);
router.post('/refresh', AuthController.refresh);
router.post('/forgot-password', passwordLimiter, validateRequest(forgotPasswordValidator), AuthController.forgotPassword);
router.post('/reset-password', passwordLimiter, validateRequest(resetPasswordValidator), AuthController.resetPassword);
router.get('/verify-email', validateRequest(verifyEmailValidator), AuthController.verifyEmail);
router.post('/resend-verification', authLimiter, validateRequest(resendVerificationValidator), AuthController.resendVerification);

// ─── Protected Routes ──────────────────────────────────────
router.get('/me', authenticate, AuthController.getFullProfile);
router.post('/change-password', authenticate, validateRequest(changePasswordValidator), AuthController.changePassword);
router.post('/logout', authenticate, AuthController.logout);

export default router;
