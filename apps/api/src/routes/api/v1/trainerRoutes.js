import express from 'express';
import { protect, authorize } from '../../../middlewares/authMiddleware.js';

/**
 * Trainer Routes — Only Trainer or Admin can access /trainer/*.
 * Member and Guest access is rejected by backend RBAC.
 */
const router = express.Router();

router.use(protect, authorize('TRAINER', 'ADMIN', 'trainer', 'admin'));

// ─── Trainer Dashboard Overview ───────────────────────────────────────────────
router.get('/dashboard', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Trainer dashboard access granted.',
    trainer: {
      id: req.user.id || req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// ─── Assigned Members ────────────────────────────────────────────────────────
router.get('/members', (req, res) => {
  res.status(200).json({ success: true, message: 'Assigned members list (trainer view).', members: [] });
});

// ─── Workout Plans ────────────────────────────────────────────────────────────
router.get('/workouts', (req, res) => {
  res.status(200).json({ success: true, message: 'Workout plans managed by trainer.', workouts: [] });
});

// ─── Diet Plans ───────────────────────────────────────────────────────────────
router.get('/diets', (req, res) => {
  res.status(200).json({ success: true, message: 'Diet plans managed by trainer.', diets: [] });
});

// ─── Attendance ───────────────────────────────────────────────────────────────
router.get('/attendance', (req, res) => {
  res.status(200).json({ success: true, message: 'Attendance records for trainer.', attendance: [] });
});

// ─── Schedule / Classes ───────────────────────────────────────────────────────
router.get('/schedule', (req, res) => {
  res.status(200).json({ success: true, message: 'Trainer class schedule.', classes: [] });
});

export default router;
