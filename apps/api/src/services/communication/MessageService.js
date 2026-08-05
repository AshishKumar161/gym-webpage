import prisma from '../../config/prisma.js';
import NotificationService from './NotificationService.js';

class MessageService {
  /**
   * Send a secure message
   */
  static async sendMessage(senderId, receiverId, content, attachment = null) {
    const message = await prisma.message.create({
      data: { senderId, receiverId, content, attachment }
    });

    const sender = await prisma.user.findUnique({ where: { id: senderId } });

    // Notify receiver
    await NotificationService.dispatch(
      receiverId,
      `New Message from ${sender.name}`,
      content.length > 50 ? content.substring(0, 47) + '...' : content,
      { type: 'message', actionUrl: '/dashboard#messages' }
    );

    return message;
  }

  /**
   * Get conversation between two users
   */
  static async getConversation(userId1, userId2) {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 }
        ]
      },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, name: true, role: true, avatar: true } }
      }
    });

    // Mark as read for the user requesting (userId1)
    await prisma.message.updateMany({
      where: { senderId: userId2, receiverId: userId1, readAt: null },
      data: { readAt: new Date() }
    });

    return messages;
  }

  /**
   * Get recent contacts list for a user
   */
  static async getContacts(userId) {
    // Find all distinct users this user has messaged or received messages from
    const sent = await prisma.message.findMany({
      where: { senderId: userId },
      select: { receiverId: true },
      distinct: ['receiverId']
    });
    
    const received = await prisma.message.findMany({
      where: { receiverId: userId },
      select: { senderId: true },
      distinct: ['senderId']
    });

    const contactIds = new Set([...sent.map(s => s.receiverId), ...received.map(r => r.senderId)]);
    
    return await prisma.user.findMany({
      where: { id: { in: Array.from(contactIds) } },
      select: { id: true, name: true, role: true, avatar: true }
    });
  }
}

export default MessageService;
