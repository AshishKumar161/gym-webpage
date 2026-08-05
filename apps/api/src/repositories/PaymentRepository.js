import prisma from '../config/prisma.js';

export class PaymentRepository {
  static formatPayment(p) {
    if (!p) return p;
    return { ...p, amount: p.amount ? Number(p.amount) : p.amount };
  }

  static async create(paymentData) {
    const payment = await prisma.payment.create({
      data: paymentData
    });
    return this.formatPayment(payment);
  }

  static async findByUserId(userId) {
    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { paidAt: 'desc' }
    });
    return payments.map(this.formatPayment);
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
    return { payments: payments.map(this.formatPayment), total };
  }

  static async getTotalRevenue() {
    const aggregate = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'PAID' }
    });
    return aggregate._sum.amount ? Number(aggregate._sum.amount) : 0;
  }
}
