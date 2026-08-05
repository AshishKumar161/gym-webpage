import prisma from '../../config/prisma.js';
import EmailProvider from './EmailProvider.js';

class NotificationService {
  /**
   * Internal helper to check preferences
   */
  static async getUserPreferences(userId) {
    let prefs = await prisma.notificationPreference.findUnique({ where: { userId } });
    if (!prefs) {
      prefs = await prisma.notificationPreference.create({ data: { userId } });
    }
    return prefs;
  }

  /**
   * Dispatch a notification
   */
  static async dispatch(userId, title, message, options = {}) {
    const {
      type = 'info',
      actionUrl = null,
      metadata = null,
      emailTemplate = null // e.g. { subject, html }
    } = options;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const prefs = await this.getUserPreferences(userId);

    // 1. In-App Notification
    if (prefs.inAppEnabled) {
      await prisma.notification.create({
        data: {
          recipientId: userId,
          title,
          message,
          type,
          actionUrl,
          metadata: metadata ? JSON.stringify(metadata) : null,
          channel: 'IN_APP'
        }
      });
    }

    // 2. Email Notification
    if (prefs.emailEnabled && emailTemplate) {
      await EmailProvider.sendEmail(
        user.email,
        emailTemplate.subject,
        emailTemplate.html
      );
    }
    
    // 3. Push/SMS placeholders
    if (prefs.pushEnabled) {
      // TODO: Integrate Firebase FCM or similar in the future
    }
  }

  static async markAsRead(notificationId, userId) {
    return await prisma.notification.updateMany({
      where: { id: notificationId, recipientId: userId },
      data: { isRead: true }
    });
  }

  static async markAllAsRead(userId) {
    return await prisma.notification.updateMany({
      where: { recipientId: userId, isRead: false },
      data: { isRead: true }
    });
  }
}

export default NotificationService;
