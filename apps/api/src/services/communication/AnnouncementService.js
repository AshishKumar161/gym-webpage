import prisma from '../../config/prisma.js';
import NotificationService from './NotificationService.js';
import { EmailTemplates } from './EmailTemplates.js';

class AnnouncementService {
  /**
   * Broadcast an announcement
   */
  static async broadcast(title, content, targetRole, authorId) {
    const announcement = await prisma.announcement.create({
      data: { title, content, targetRole, authorId }
    });

    // Find target users
    const whereClause = targetRole === 'ALL' ? {} : { role: targetRole };
    const users = await prisma.user.findMany({ where: whereClause, select: { id: true } });

    // Send notifications to all matching users
    const emailTemplate = EmailTemplates.announcementEmail(title, content);

    // To prevent blocking on large blasts, we would ideally queue this, but for now we iterate asynchronously
    users.forEach(async (user) => {
      await NotificationService.dispatch(
        user.id,
        title,
        content.substring(0, 100), // Short excerpt for in-app
        { type: 'announcement', emailTemplate }
      );
    });

    return announcement;
  }

  /**
   * Get active announcements for a user role
   */
  static async getActiveAnnouncements(role) {
    return await prisma.announcement.findMany({
      where: {
        OR: [
          { targetRole: 'ALL' },
          { targetRole: role }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
  }
}

export default AnnouncementService;
