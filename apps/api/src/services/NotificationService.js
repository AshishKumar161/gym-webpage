import { NotificationRepository } from '../repositories/NotificationRepository.js';

export class NotificationService {
  static async getUserNotifications(recipientId) {
    return await NotificationRepository.findByRecipientId(recipientId);
  }

  static async sendNotification(data) {
    return await NotificationRepository.create(data);
  }

  static async markNotificationAsRead(id, recipientId) {
    return await NotificationRepository.markAsRead(id, recipientId);
  }
}
