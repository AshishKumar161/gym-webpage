import express from 'express';
import { generateWorkout, generateDiet, chat, adminInsights } from '../../../controllers/aiController.js';
import { protect, authorize } from '../../../middlewares/authMiddleware.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Strict rate limiting for AI to prevent billing abuse
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 AI requests per window
  message: { success: false, message: 'Too many AI requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply auth and rate limit to all AI routes
router.use(protect, aiLimiter);

// General AI Chat (Available to all authenticated users)
router.post('/chat', chat);

// Generation Tools (Members and Trainers)
router.post('/generate-workout', authorize('MEMBER', 'TRAINER'), generateWorkout);
router.post('/generate-diet', authorize('MEMBER', 'TRAINER'), generateDiet);

// Admin exclusive insights
router.get('/admin-insights', authorize('ADMIN'), adminInsights);

export default router;
