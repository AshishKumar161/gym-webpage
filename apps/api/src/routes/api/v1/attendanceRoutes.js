import express from 'express';
import { getAttendanceLogs, checkIn } from '../../../controllers/attendanceController.js';
import { protect } from '../../../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * /api/v1/attendance:
 *   get:
 *     summary: Get attendance logs
 *     tags:
 *       - Attendance
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Attendance logs retrieved
 *       401:
 *         description: Unauthorized
 */
router.get('/', getAttendanceLogs);

/**
 * @swagger
 * /api/v1/attendance/check-in:
 *   post:
 *     summary: Record member check-in
 *     tags:
 *       - Attendance
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               method: { type: 'string', example: 'QR_CODE' }
 *     responses:
 *       200:
 *         description: Check-in recorded successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/check-in', checkIn);

export default router;
