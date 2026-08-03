import prisma from '../config/prisma.js';

export class MembershipRepository {
  static async findAll() {
    return await prisma.membership.findMany({
      orderBy: { price: 'asc' }
    });
  }

  static async findById(id) {
    return await prisma.membership.findUnique({
      where: { id }
    });
  }

  static async create(membershipData) {
    return await prisma.membership.create({
      data: membershipData
    });
  }

  static async update(id, data) {
    return await prisma.membership.update({
      where: { id },
      data
    });
  }

  static async delete(id) {
    return await prisma.membership.delete({
      where: { id }
    });
  }

  static async createSubscription(subscriptionData) {
    return await prisma.subscription.create({
      data: subscriptionData
    });
  }

  static async findActiveSubscriptionsByUserId(userId) {
    return await prisma.subscription.findMany({
      where: { userId, status: 'active' },
      include: { membership: true }
    });
  }
}
