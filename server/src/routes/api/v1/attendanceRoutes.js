import express from 'express';
import { getAttendanceLogs, checkIn } from '../../../controllers/attendanceController.js';
import { protect } from '../../../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getAttendanceLogs);
router.post('/check-in', checkIn);

export default router;
