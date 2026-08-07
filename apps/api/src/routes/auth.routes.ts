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

import jwt from 'jsonwebtoken';

const authenticate = (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ status: 'fail', message: 'Access token required' });
    }
    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'supersecret_development_key';
    const decoded = jwt.verify(token, secret) as any;
    req.user = { id: decoded.id, branchId: decoded.branchId, roles: decoded.roles || [] };
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ status: 'fail', message: 'Access token expired' });
    }
    return res.status(401).json({ status: 'fail', message: 'Invalid access token' });
  }
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
router.post('/refresh-token', AuthController.refresh); // Frontend compatibility alias
router.post('/forgot-password', passwordLimiter, validateRequest(forgotPasswordValidator), AuthController.forgotPassword);
router.post('/reset-password', passwordLimiter, validateRequest(resetPasswordValidator), AuthController.resetPassword);
router.get('/verify-email', validateRequest(verifyEmailValidator), AuthController.verifyEmail);
router.post('/resend-verification', authLimiter, validateRequest(resendVerificationValidator), AuthController.resendVerification);

// ─── Protected Routes ──────────────────────────────────────
router.get('/me', authenticate, AuthController.getFullProfile);
router.post('/change-password', authenticate, validateRequest(changePasswordValidator), AuthController.changePassword);
router.post('/logout', authenticate, AuthController.logout);

export default router;
