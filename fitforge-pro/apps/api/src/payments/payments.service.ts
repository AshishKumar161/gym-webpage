import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, PaymentStatus, MembershipStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, query: Record<string, string>) {
    const requester = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!requester) throw new NotFoundException('User not found');

    const page = query.page ? parseInt(query.page) : 1;
    const limit = query.limit ? parseInt(query.limit) : 10;
    const skip = (page - 1) * limit;

    if (requester.role === Role.ADMIN || requester.role === Role.OWNER) {
      const [items, total] = await Promise.all([
        this.prisma.payment.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
            membership: { include: { plan: true } },
          },
        }),
        this.prisma.payment.count(),
      ]);

      return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    // Members see their own payments
    const items = await this.prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        membership: { include: { plan: true } },
      },
    });

    return { items, total: items.length };
  }

  async findOne(id: string, userId: string) {
    const requester = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!requester) throw new NotFoundException('User not found');

    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        membership: { include: { plan: true } },
      },
    });

    if (!payment) throw new NotFoundException('Payment not found');

    if (
      payment.userId !== userId &&
      requester.role !== Role.ADMIN &&
      requester.role !== Role.OWNER
    ) {
      throw new ForbiddenException('Access denied');
    }

    return payment;
  }

  async create(userId: string, dto: any) {
    const { amount, membershipId, gateway = 'RAZORPAY', description } = dto;

    const gatewayOrderId = `order_${Date.now()}`;
    const gatewayPaymentId = `pay_${Date.now()}`;

    // Create the payment record
    const payment = await this.prisma.payment.create({
      data: {
        userId,
        membershipId,
        amount,
        status: PaymentStatus.SUCCESS, // Simulate instant success
        gateway,
        gatewayOrderId,
        gatewayPaymentId,
        description: description ?? 'Membership Subscription',
        receiptId: `rcpt_${Date.now()}`,
      },
    });

    // If linked to a membership, activate it
    if (membershipId) {
      await this.prisma.membership.update({
        where: { id: membershipId },
        data: { status: MembershipStatus.ACTIVE },
      });
    }

    // Award reward points for the payment
    const pointsEarned = Math.floor(amount / 1000); // 1 point for every 10 Rupees/major unit
    if (pointsEarned > 0) {
      await this.prisma.rewardPoint.create({
        data: {
          userId,
          points: pointsEarned,
          type: 'EARNED',
          description: `Reward points for payment ${payment.id}`,
          referenceId: payment.id,
        },
      });
    }

    return payment;
  }

  async update(id: string, userId: string, dto: any) {
    const requester = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!requester) throw new NotFoundException('User not found');

    if (requester.role !== Role.ADMIN && requester.role !== Role.OWNER) {
      throw new ForbiddenException('Only administrators can update payment details');
    }

    const payment = await this.prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) throw new NotFoundException('Payment not found');

    return this.prisma.payment.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, userId: string) {
    const requester = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!requester) throw new NotFoundException('User not found');

    if (requester.role !== Role.ADMIN && requester.role !== Role.OWNER) {
      throw new ForbiddenException('Only administrators can cancel transactions');
    }

    // Mark as failed or refunded instead of deleting
    return this.prisma.payment.update({
      where: { id },
      data: { status: PaymentStatus.FAILED },
    });
  }
}

