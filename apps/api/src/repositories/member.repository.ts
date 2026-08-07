import prisma from '../config/prisma.js';
import { Prisma } from '@prisma/client';

interface MemberListParams {
  gymId: string;
  branchId?: string;
  page: number;
  limit: number;
  search?: string;
  status?: string;
  sortBy: string;
  order: 'asc' | 'desc';
}

export class MemberRepository {
  async findAll(params: MemberListParams) {
    const { gymId, branchId, page, limit, search, status, sortBy, order } = params;

    const where: Prisma.MemberProfileWhereInput = {
      gymId,
      deletedAt: null,
      ...(branchId && { branchId }),
      ...(search && {
        OR: [
          { user: { firstName: { contains: search, mode: 'insensitive' } } },
          { user: { lastName: { contains: search, mode: 'insensitive' } } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
          { user: { phone: { contains: search } } },
          { memberId: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(status && status !== 'ALL' && {
        memberships: {
          some: { status: status as any },
        },
      }),
    };

    const [data, total] = await Promise.all([
      prisma.memberProfile.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: sortBy === 'name'
          ? { user: { firstName: order } }
          : { [sortBy]: order },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true, phone: true, avatarUrl: true, isActive: true },
          },
          memberships: {
            where: { status: { in: ['ACTIVE', 'FROZEN', 'PENDING'] } },
            include: { plan: { select: { name: true, duration: true } } },
            orderBy: { endDate: 'desc' },
            take: 1,
          },
          trainerAssignment: {
            include: {
              memberProfile: false,
            },
          },
        },
      }),
      prisma.memberProfile.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(memberProfileId: string, gymId: string) {
    return prisma.memberProfile.findFirst({
      where: { id: memberProfileId, gymId, deletedAt: null },
      include: {
        user: {
          select: {
            id: true, firstName: true, lastName: true, email: true, phone: true,
            avatarUrl: true, isActive: true, createdAt: true,
          },
        },
        memberships: {
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
        },
        notes: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        trainerAssignment: true,
      },
    });
  }

  async create(data: {
    gymId: string;
    branchId: string;
    userId: string;
    memberId: string;
    referralCode: string;
    referredBy?: string;
    source?: string;
    gender?: string;
    dateOfBirth?: Date;
    bloodGroup?: string;
    emergencyContact?: string;
    emergencyName?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    weight?: number;
    height?: number;
    medicalConditions?: string;
    fitnessGoal?: string;
  }) {
    return prisma.memberProfile.create({ data: data as any });
  }

  async update(memberProfileId: string, gymId: string, data: Prisma.MemberProfileUpdateInput) {
    const member = await prisma.memberProfile.findFirst({
      where: { id: memberProfileId, gymId, deletedAt: null },
    });
    if (!member) return null;
    return prisma.memberProfile.update({ where: { id: memberProfileId }, data });
  }

  async softDelete(memberProfileId: string, gymId: string) {
    const member = await prisma.memberProfile.findFirst({
      where: { id: memberProfileId, gymId, deletedAt: null },
    });
    if (!member) return null;

    return prisma.$transaction([
      prisma.memberProfile.update({
        where: { id: memberProfileId },
        data: { deletedAt: new Date() },
      }),
      prisma.user.update({
        where: { id: member.userId },
        data: { deletedAt: new Date(), isActive: false },
      }),
    ]);
  }

  async getNextMemberId(gymId: string): Promise<string> {
    const count = await prisma.memberProfile.count({ where: { gymId } });
    return `A2R-${String(count + 1).padStart(4, '0')}`;
  }

  async findByReferralCode(code: string) {
    return prisma.memberProfile.findUnique({
      where: { referralCode: code },
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  // ─── Membership Operations ────────────────────────────────

  async createMembership(data: {
    gymId: string;
    memberProfileId: string;
    planId: string;
    startDate: Date;
    endDate: Date;
    paidAmount: number;
    discountAmount: number;
    status: string;
    notes?: string;
  }) {
    return prisma.memberMembership.create({ data: data as any });
  }

  async getActiveMembership(memberProfileId: string) {
    return prisma.memberMembership.findFirst({
      where: {
        memberProfileId,
        status: { in: ['ACTIVE', 'FROZEN'] },
      },
      include: { plan: true },
      orderBy: { endDate: 'desc' },
    });
  }

  async updateMembership(membershipId: string, data: Prisma.MemberMembershipUpdateInput) {
    return prisma.memberMembership.update({ where: { id: membershipId }, data });
  }

  // ─── Notes ────────────────────────────────────────────────

  async addNote(data: {
    gymId: string;
    memberProfileId: string;
    createdById: string;
    content: string;
    isPrivate: boolean;
  }) {
    return prisma.memberNote.create({ data });
  }

  async deleteNote(noteId: string, gymId: string) {
    return prisma.memberNote.update({
      where: { id: noteId },
      data: { deletedAt: new Date() },
    });
  }

  // ─── Trainer Assignment ───────────────────────────────────

  async assignTrainer(data: {
    gymId: string;
    memberProfileId: string;
    trainerId: string;
    assignedById: string;
    notes?: string;
  }) {
    return prisma.trainerMemberAssignment.upsert({
      where: { memberProfileId: data.memberProfileId },
      update: {
        trainerId: data.trainerId,
        assignedById: data.assignedById,
        notes: data.notes,
        assignedAt: new Date(),
      },
      create: data,
    });
  }

  async removeTrainerAssignment(memberProfileId: string) {
    return prisma.trainerMemberAssignment.delete({
      where: { memberProfileId },
    }).catch(() => null);
  }

  // ─── Stats ────────────────────────────────────────────────

  async getStats(gymId: string, branchId?: string) {
    const where = { gymId, deletedAt: null, ...(branchId && { branchId }) };

    const [total, active, expired, frozen] = await Promise.all([
      prisma.memberProfile.count({ where }),
      prisma.memberMembership.count({
        where: { gymId, status: 'ACTIVE' },
      }),
      prisma.memberMembership.count({
        where: { gymId, status: 'EXPIRED' },
      }),
      prisma.memberMembership.count({
        where: { gymId, status: 'FROZEN' },
      }),
    ]);

    return { total, active, expired, frozen };
  }
}

export const memberRepository = new MemberRepository();
