import express from 'express';
import { getNotifications, createNotification, markNotificationRead } from '../../../controllers/notificationController.js';
import { protect, authorize } from '../../../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);
router.post('/', authorize('admin', 'trainer'), createNotification);
router.patch('/:id/read', markNotificationRead);

export default router;
