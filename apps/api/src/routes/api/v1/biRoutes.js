import express from 'express';
import biController from '../../../controllers/biController.js';
import { protect, authorize } from '../../../middlewares/authMiddleware.js';

const router = express.Router();

// Protect all BI routes to ADMIN only
router.use(protect, authorize('ADMIN'));

router.get('/executive-summary', biController.getExecutiveSummary);
router.get('/revenue-trends', biController.getRevenueTrends);
router.get('/membership-distribution', biController.getMembershipDistribution);
router.get('/attendance-analytics', biController.getAttendanceAnalytics);
router.get('/ai-forecast', biController.getAIForecast);

export default router;
