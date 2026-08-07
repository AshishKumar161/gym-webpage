import prisma from '../config/prisma.js';
import { Prisma } from '@prisma/client';

export class PlanRepository {
  async findAll(gymId: string, includeInactive = false) {
    return prisma.membershipPlan.findMany({
      where: {
        gymId,
        deletedAt: null,
        ...(includeInactive ? {} : { isActive: true }),
      },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: {
            memberships: { where: { status: 'ACTIVE' } },
          },
        },
      },
    });
  }

  async findById(planId: string, gymId: string) {
    return prisma.membershipPlan.findFirst({
      where: { id: planId, gymId, deletedAt: null },
      include: {
        _count: {
          select: {
            memberships: { where: { status: 'ACTIVE' } },
          },
        },
      },
    });
  }

  async create(data: Prisma.MembershipPlanCreateInput) {
    return prisma.membershipPlan.create({ data });
  }

  async update(planId: string, gymId: string, data: Prisma.MembershipPlanUpdateInput) {
    const plan = await prisma.membershipPlan.findFirst({
      where: { id: planId, gymId, deletedAt: null },
    });
    if (!plan) return null;
    return prisma.membershipPlan.update({ where: { id: planId }, data });
  }

  async softDelete(planId: string, gymId: string) {
    const plan = await prisma.membershipPlan.findFirst({
      where: { id: planId, gymId, deletedAt: null },
    });
    if (!plan) return null;
    return prisma.membershipPlan.update({
      where: { id: planId },
      data: { deletedAt: new Date(), isActive: false },
    });
  }
}

export const planRepository = new PlanRepository();
