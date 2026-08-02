import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, MembershipStatus } from '@prisma/client';

@Injectable()
export class MembershipsService {
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
        this.prisma.membership.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
            plan: true,
          },
        }),
        this.prisma.membership.count(),
      ]);

      return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    // Regular members only see their own memberships
    const items = await this.prisma.membership.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { plan: true },
    });

    return { items, total: items.length };
  }

  async findOne(id: string, userId: string) {
    const requester = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!requester) throw new NotFoundException('User not found');

    const membership = await this.prisma.membership.findUnique({
      where: { id },
      include: { plan: true, user: { select: { firstName: true, lastName: true, email: true } } },
    });

    if (!membership) throw new NotFoundException('Membership not found');

    if (
      membership.userId !== userId &&
      requester.role !== Role.ADMIN &&
      requester.role !== Role.OWNER
    ) {
      throw new ForbiddenException('Access denied');
    }

    return membership;
  }

  async create(userId: string, dto: any) {
    const { planId, months = 1 } = dto;

    const plan = await this.prisma.membershipPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) throw new NotFoundException('Membership plan not found');

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(startDate.getMonth() + months);

    // Cancel other active memberships for this user
    await this.prisma.membership.updateMany({
      where: { userId, status: MembershipStatus.ACTIVE },
      data: { status: MembershipStatus.EXPIRED },
    });

    const qrCode = `fitforge-membership-${userId}-${Date.now()}`;

    return this.prisma.membership.create({
      data: {
        userId,
        planId,
        startDate,
        endDate,
        status: MembershipStatus.ACTIVE,
        qrCode,
        autoRenew: dto.autoRenew ?? false,
      },
      include: { plan: true },
    });
  }

  async update(id: string, userId: string, dto: any) {
    const requester = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!requester) throw new NotFoundException('User not found');

    const membership = await this.prisma.membership.findUnique({
      where: { id },
    });

    if (!membership) throw new NotFoundException('Membership not found');

    if (
      membership.userId !== userId &&
      requester.role !== Role.ADMIN &&
      requester.role !== Role.OWNER
    ) {
      throw new ForbiddenException('Access denied');
    }

    const data: any = {};
    if (dto.autoRenew !== undefined) data.autoRenew = dto.autoRenew;
    if (dto.status !== undefined && (requester.role === Role.ADMIN || requester.role === Role.OWNER)) {
      data.status = dto.status;
    }

    return this.prisma.membership.update({
      where: { id },
      data,
      include: { plan: true },
    });
  }

  async remove(id: string, userId: string) {
    const requester = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!requester) throw new NotFoundException('User not found');

    const membership = await this.prisma.membership.findUnique({
      where: { id },
    });

    if (!membership) throw new NotFoundException('Membership not found');

    if (
      membership.userId !== userId &&
      requester.role !== Role.ADMIN &&
      requester.role !== Role.OWNER
    ) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.membership.update({
      where: { id },
      data: { status: MembershipStatus.CANCELLED },
      include: { plan: true },
    });
  }
}

