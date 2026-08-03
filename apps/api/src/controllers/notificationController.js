import { NotificationService } from '../services/NotificationService.js';
import { sendResponse } from '../utils/responseFormatter.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getMyNotifications = asyncHandler(async (req, res) => {
  const recipientId = req.user.id || req.user._id?.toString();
  const notifications = await NotificationService.getUserNotifications(recipientId);
  return sendResponse(res, 200, 'Notifications retrieved successfully.', notifications);
});

export const markAsRead = asyncHandler(async (req, res) => {
  const recipientId = req.user.id || req.user._id?.toString();
  await NotificationService.markNotificationAsRead(req.params.id, recipientId);
  return sendResponse(res, 200, 'Notification marked as read.');
});
