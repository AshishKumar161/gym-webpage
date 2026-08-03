import prisma from '../config/prisma.js';

export class PaymentRepository {
  static async create(paymentData) {
    return await prisma.payment.create({
      data: paymentData
    });
  }

  static async findByUserId(userId) {
    return await prisma.payment.findMany({
      where: { userId },
      orderBy: { paidAt: 'desc' }
    });
  }

  static async findAll({ skip = 0, take = 50 }) {
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        skip,
        take,
        include: {
          user: { select: { id: true, name: true, email: true } }
        },
        orderBy: { paidAt: 'desc' }
      }),
      prisma.payment.count()
    ]);
    return { payments, total };
  }

  static async getTotalRevenue() {
    const aggregate = await prisma.payment.aggregate({
      _sum: { amount: true }
    });
    return aggregate._sum.amount || 0;
  }
}
