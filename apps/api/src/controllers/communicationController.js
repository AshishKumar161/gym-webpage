import prisma from '../config/prisma.js';
import NotificationService from '../services/communication/NotificationService.js';
import MessageService from '../services/communication/MessageService.js';
import AnnouncementService from '../services/communication/AnnouncementService.js';

// --- Notifications ---
export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { recipientId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.status(200).json({ success: true, data: notifications });
  } catch (err) { next(err); }
};

export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await prisma.notification.count({
      where: { recipientId: req.user.id, isRead: false }
    });
    res.status(200).json({ success: true, data: count });
  } catch (err) { next(err); }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    await NotificationService.markAsRead(req.params.id, req.user.id);
    res.status(200).json({ success: true, message: 'Marked as read' });
  } catch (err) { next(err); }
};

export const markAllNotificationsRead = async (req, res, next) => {
  try {
    await NotificationService.markAllAsRead(req.user.id);
    res.status(200).json({ success: true, message: 'All marked as read' });
  } catch (err) { next(err); }
};

// --- Preferences ---
export const getPreferences = async (req, res, next) => {
  try {
    const prefs = await NotificationService.getUserPreferences(req.user.id);
    res.status(200).json({ success: true, data: prefs });
  } catch (err) { next(err); }
};

export const updatePreferences = async (req, res, next) => {
  try {
    const { emailEnabled, inAppEnabled, pushEnabled, marketingEnabled } = req.body;
    const prefs = await prisma.notificationPreference.update({
      where: { userId: req.user.id },
      data: { emailEnabled, inAppEnabled, pushEnabled, marketingEnabled }
    });
    res.status(200).json({ success: true, data: prefs });
  } catch (err) { next(err); }
};

// --- Messaging ---
export const getContacts = async (req, res, next) => {
  try {
    const contacts = await MessageService.getContacts(req.user.id);
    res.status(200).json({ success: true, data: contacts });
  } catch (err) { next(err); }
};

export const getConversation = async (req, res, next) => {
  try {
    const messages = await MessageService.getConversation(req.user.id, req.params.userId);
    res.status(200).json({ success: true, data: messages });
  } catch (err) { next(err); }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, content, attachment } = req.body;
    const message = await MessageService.sendMessage(req.user.id, receiverId, content, attachment);
    res.status(201).json({ success: true, data: message });
  } catch (err) { next(err); }
};

// --- Announcements ---
export const getAnnouncements = async (req, res, next) => {
  try {
    const announcements = await AnnouncementService.getActiveAnnouncements(req.user.role);
    res.status(200).json({ success: true, data: announcements });
  } catch (err) { next(err); }
};

export const createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, targetRole } = req.body;
    const announcement = await AnnouncementService.broadcast(title, content, targetRole, req.user.id);
    res.status(201).json({ success: true, data: announcement });
  } catch (err) { next(err); }
};
