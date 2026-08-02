import express from 'express';
import { protect, authorize } from '../../../middlewares/authMiddleware.js';

/**
 * Member Routes — All routes require authentication + member, trainer, or admin role.
 * Backend enforces authorization. Frontend cannot bypass these checks.
 */
const router = express.Router();

// Apply protect + authorize to all routes in this namespace
router.use(protect, authorize('member', 'trainer', 'admin'));

// ─── Member Dashboard Overview ────────────────────────────────────────────────
router.get('/dashboard', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Member dashboard access granted.',
    member: {
      id: req.user._id,
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
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      avatar: req.user.avatar,
      role: req.user.role,
      isVerified: req.user.isVerified,
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
