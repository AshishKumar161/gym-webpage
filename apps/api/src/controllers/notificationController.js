import { NotificationService } from '../services/NotificationService.js';
import { sendResponse } from '../utils/responseFormatter.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getMyNotifications = asyncHandler(async (req, res) => {
  const recipientId = req.user.id;
  const notifications = await NotificationService.getUserNotifications(recipientId);
  return sendResponse(res, 200, 'Notifications retrieved successfully.', notifications);
});

export const markAsRead = asyncHandler(async (req, res) => {
  const recipientId = req.user.id;
  await NotificationService.markNotificationAsRead(req.params.id, recipientId);
  return sendResponse(res, 200, 'Notification marked as read.');
});

export const getNotifications = asyncHandler(async (req, res) => {
  const recipientId = req.user?.id;
  const notifications = await NotificationService.getUserNotifications(recipientId);
  return sendResponse(res, 200, 'Notifications retrieved successfully.', notifications);
});

export const createNotification = asyncHandler(async (req, res) => {
  return sendResponse(res, 201, 'Notification created successfully.');
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const recipientId = req.user?.id;
  await NotificationService.markNotificationAsRead(req.params.id, recipientId);
  return sendResponse(res, 200, 'Notification marked as read.');
});

