import prisma from '../config/prisma.js';

export class MembershipRepository {
  static formatMembership(m) {
    if (!m) return m;
    return { ...m, price: m.price ? Number(m.price) : m.price };
  }

  static async findAll() {
    const memberships = await prisma.membership.findMany({
      orderBy: { price: 'asc' }
    });
    return memberships.map(this.formatMembership);
  }

  static async findById(id) {
    const membership = await prisma.membership.findUnique({
      where: { id }
    });
    return this.formatMembership(membership);
  }

  static async create(membershipData) {
    const membership = await prisma.membership.create({
      data: membershipData
    });
    return this.formatMembership(membership);
  }

  static async update(id, data) {
    const membership = await prisma.membership.update({
      where: { id },
      data
    });
    return this.formatMembership(membership);
  }

  static async delete(id) {
    const membership = await prisma.membership.delete({
      where: { id }
    });
    return this.formatMembership(membership);
  }

  static async createSubscription(subscriptionData) {
    return await prisma.subscription.create({
      data: subscriptionData
    });
  }

  static async findActiveSubscriptionsByUserId(userId) {
    const subs = await prisma.subscription.findMany({
      where: { userId, status: 'ACTIVE' },
      include: { membership: true }
    });
    return subs.map(sub => ({
      ...sub,
      membership: this.formatMembership(sub.membership)
    }));
  }
}
