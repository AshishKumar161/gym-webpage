import express from 'express';
import { protect, authorize } from '../../../middlewares/authMiddleware.js';
import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  getPreferences,
  updatePreferences,
  getContacts,
  getConversation,
  sendMessage,
  getAnnouncements,
  createAnnouncement
} from '../../../controllers/communicationController.js';

const router = express.Router();

router.use(protect);

// Notifications
router.get('/notifications', getNotifications);
router.get('/notifications/unread-count', getUnreadCount);
router.put('/notifications/read-all', markAllNotificationsRead);
router.put('/notifications/:id/read', markNotificationRead);

// Preferences
router.get('/preferences', getPreferences);
router.put('/preferences', updatePreferences);

// Messaging
router.get('/messages/contacts', getContacts);
router.get('/messages/conversation/:userId', getConversation);
router.post('/messages', sendMessage);

// Announcements
router.get('/announcements', getAnnouncements);
router.post('/announcements', authorize('ADMIN'), createAnnouncement);

export default router;
