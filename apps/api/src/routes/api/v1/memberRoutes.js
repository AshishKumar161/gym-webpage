import express from 'express';
import { protect, authorize } from '../../../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect, authorize('MEMBER', 'TRAINER', 'ADMIN', 'member', 'trainer', 'admin'));

/**
 * @swagger
 * /api/v1/member/dashboard:
 *   get:
 *     summary: Get Member Dashboard Overview
 *     tags:
 *       - Members & Dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Member dashboard stats retrieved
 *       401:
 *         description: Unauthorized
 */
router.get('/dashboard', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Member dashboard access granted.',
    member: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
});

/**
 * @swagger
 * /api/v1/member/profile:
 *   get:
 *     summary: Get Member Profile
 *     tags:
 *       - Members & Dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile details retrieved
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      avatar: req.user.avatar,
      role: req.user.role,
      emailVerified: req.user.emailVerified,
      lastLogin: req.user.lastLogin
    }
  });
});

/**
 * @swagger
 * /api/v1/member/membership:
 *   get:
 *     summary: Get Active Membership Details
 *     tags:
 *       - Members & Dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active membership info
 */
router.get('/membership', (req, res) => {
  res.status(200).json({ success: true, message: 'Member membership details.', membership: null });
});

/**
 * @swagger
 * /api/v1/member/attendance:
 *   get:
 *     summary: Get Personal Attendance History
 *     tags:
 *       - Members & Dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Personal attendance logs
 */
router.get('/attendance', (req, res) => {
  res.status(200).json({ success: true, message: 'Member attendance history.', attendance: [] });
});

/**
 * @swagger
 * /api/v1/member/workout:
 *   get:
 *     summary: Get Assigned Workout Plan
 *     tags:
 *       - Members & Dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Assigned workout plan
 */
router.get('/workout', (req, res) => {
  res.status(200).json({ success: true, message: 'Member workout plan.', plan: null });
});

/**
 * @swagger
 * /api/v1/member/diet:
 *   get:
 *     summary: Get Assigned Diet Plan
 *     tags:
 *       - Members & Dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Assigned diet plan
 */
router.get('/diet', (req, res) => {
  res.status(200).json({ success: true, message: 'Member diet plan.', plan: null });
});

/**
 * @swagger
 * /api/v1/member/payments:
 *   get:
 *     summary: Get Personal Payment History
 *     tags:
 *       - Members & Dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment transaction history
 */
router.get('/payments', (req, res) => {
  res.status(200).json({ success: true, message: 'Member payment history.', payments: [] });
});

export default router;
