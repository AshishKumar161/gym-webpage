import express from 'express';
import { protect, authorize } from '../../../middlewares/authMiddleware.js';

/**
 * Member Routes — Member, Trainer, or Admin can access /member/*.
 * Guest access is rejected by backend RBAC.
 */
const router = express.Router();

router.use(protect, authorize('MEMBER', 'TRAINER', 'ADMIN', 'member', 'trainer', 'admin'));

// ─── Member Dashboard Overview ────────────────────────────────────────────────
router.get('/dashboard', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Member dashboard access granted.',
    member: {
      id: req.user.id || req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// ─── Profile ──────────────────────────────────────────────────────────────────
router.get('/profile', (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user.id || req.user._id,
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

// ─── Membership ───────────────────────────────────────────────────────────────
router.get('/membership', (req, res) => {
  res.status(200).json({ success: true, message: 'Member membership details.', membership: null });
});

// ─── Attendance ───────────────────────────────────────────────────────────────
router.get('/attendance', (req, res) => {
  res.status(200).json({ success: true, message: 'Member attendance history.', attendance: [] });
});

// ─── Workout Plan ─────────────────────────────────────────────────────────────
router.get('/workout', (req, res) => {
  res.status(200).json({ success: true, message: 'Member workout plan.', plan: null });
});

// ─── Diet Plan ────────────────────────────────────────────────────────────────
router.get('/diet', (req, res) => {
  res.status(200).json({ success: true, message: 'Member diet plan.', plan: null });
});

// ─── Payments ─────────────────────────────────────────────────────────────────
router.get('/payments', (req, res) => {
  res.status(200).json({ success: true, message: 'Member payment history.', payments: [] });
});

export default router;
