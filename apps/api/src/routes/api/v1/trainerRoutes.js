import express from 'express';
import { protect, authorize } from '../../../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect, authorize('TRAINER', 'ADMIN', 'trainer', 'admin'));

/**
 * @swagger
 * /api/v1/trainer/dashboard:
 *   get:
 *     summary: Get Trainer Dashboard Overview
 *     tags:
 *       - Trainers
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trainer dashboard metrics
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Trainer/Admin only
 */
router.get('/dashboard', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Trainer dashboard access granted.',
    trainer: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
});

/**
 * @swagger
 * /api/v1/trainer/members:
 *   get:
 *     summary: List Assigned Members for Trainer
 *     tags:
 *       - Trainers
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of assigned members
 *       401:
 *         description: Unauthorized
 */
router.get('/members', (req, res) => {
  res.status(200).json({ success: true, message: 'Assigned members list (trainer view).', members: [] });
});

/**
 * @swagger
 * /api/v1/trainer/workouts:
 *   get:
 *     summary: Get Workout Plans Managed by Trainer
 *     tags:
 *       - Trainers
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Workout plans managed by trainer
 */
router.get('/workouts', (req, res) => {
  res.status(200).json({ success: true, message: 'Workout plans managed by trainer.', workouts: [] });
});

/**
 * @swagger
 * /api/v1/trainer/diets:
 *   get:
 *     summary: Get Diet Plans Managed by Trainer
 *     tags:
 *       - Trainers
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Diet plans managed by trainer
 */
router.get('/diets', (req, res) => {
  res.status(200).json({ success: true, message: 'Diet plans managed by trainer.', diets: [] });
});

/**
 * @swagger
 * /api/v1/trainer/attendance:
 *   get:
 *     summary: Get Attendance Logs for Assigned Members
 *     tags:
 *       - Trainers
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Attendance logs
 */
router.get('/attendance', (req, res) => {
  res.status(200).json({ success: true, message: 'Attendance records for trainer.', attendance: [] });
});

/**
 * @swagger
 * /api/v1/trainer/schedule:
 *   get:
 *     summary: Get Trainer Class & Appointment Schedule
 *     tags:
 *       - Trainers
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trainer schedule
 */
router.get('/schedule', (req, res) => {
  res.status(200).json({ success: true, message: 'Trainer class schedule.', classes: [] });
});

export default router;
