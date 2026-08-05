import prisma from '../../config/prisma.js';
import { addMonths, isAfter, isBefore } from 'date-fns';

export class SubscriptionService {
  /**
   * Check and update expired subscriptions
   */
  static async checkExpiries() {
    const now = new Date();
    
    // Find ACTIVE or GRACE_PERIOD subscriptions where endDate is in the past
    const expiredSubs = await prisma.subscription.findMany({
      where: {
        status: { in: ['ACTIVE', 'GRACE_PERIOD'] },
        endDate: { lt: now }
      }
    });

    for (const sub of expiredSubs) {
      await prisma.subscription.update({
        where: { id: sub.id },
        data: { status: 'EXPIRED' }
      });
      // Optionally queue a notification here
    }
  }

  /**
   * Renew or Upgrade a subscription
   */
  static async processRenewal(userId, membershipId, durationMonths, paymentRef) {
    const now = new Date();
    const endDate = addMonths(now, durationMonths);

    // Cancel existing active ones
    await prisma.subscription.updateMany({
      where: { userId, status: { in: ['ACTIVE', 'TRIAL', 'GRACE_PERIOD'] } },
      data: { status: 'CANCELLED', cancellationReason: 'Upgraded/Renewed' }
    });

    return await prisma.subscription.create({
      data: {
        userId,
        membershipId,
        startDate: now,
        endDate,
        status: 'ACTIVE',
        paymentReference: paymentRef
      }
    });
  }

  /**
   * Freeze a subscription (Pause)
   */
  static async freezeSubscription(subscriptionId) {
    const sub = await prisma.subscription.findUnique({ where: { id: subscriptionId } });
    if (!sub || sub.status !== 'ACTIVE') throw new Error("Can only freeze ACTIVE subscriptions.");

    return await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: 'FROZEN' }
    });
  }

  /**
   * Resume a frozen subscription
   */
  static async resumeSubscription(subscriptionId) {
    const sub = await prisma.subscription.findUnique({ where: { id: subscriptionId } });
    if (!sub || sub.status !== 'FROZEN') throw new Error("Can only resume FROZEN subscriptions.");
    
    // In a real system, we'd adjust endDate based on frozen duration
    return await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: 'ACTIVE' }
    });
  }
}
