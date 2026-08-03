import prisma from '../config/prisma.js';

export class NotificationRepository {
  static async findByRecipientId(recipientId) {
    return await prisma.notification.findMany({
      where: { recipientId },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async create(notificationData) {
    return await prisma.notification.create({
      data: notificationData
    });
  }

  static async markAsRead(id, recipientId) {
    return await prisma.notification.updateMany({
      where: { id, recipientId },
      data: { isRead: true }
    });
  }

  static async createAuditLog(auditData) {
    try {
      return await prisma.auditLog.create({
        data: auditData
      });
    } catch {
      return null;
    }
  }
}
