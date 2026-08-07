import bcrypt from 'bcryptjs';
import { memberRepository } from '../repositories/member.repository.js';
import { planRepository } from '../repositories/plan.repository.js';
import { AppError } from '../utils/AppError.js';
// @ts-ignore
import logger from '../utils/logger.js';
import prisma from '../config/prisma.js';

const SALT_ROUNDS = 12;

function generateReferralCode(name: string): string {
  const cleanName = name.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${cleanName}${random}`;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export class MemberService {
  async getAll(gymId: string, query: Record<string, unknown>) {
    return memberRepository.findAll({
      gymId,
      branchId: query.branchId as string | undefined,
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 20,
      search: query.search as string | undefined,
      status: query.status as string | undefined,
      sortBy: (query.sortBy as string) || 'createdAt',
      order: (query.order as 'asc' | 'desc') || 'desc',
    });
  }

  async getById(memberProfileId: string, gymId: string) {
    const member = await memberRepository.findById(memberProfileId, gymId);
    if (!member) throw new AppError('Member not found', 404);
    return member;
  }

  async create(gymId: string, branchId: string, createdById: string, data: Record<string, any>) {
    // 1. Generate member ID and referral code
    const memberId = await memberRepository.getNextMemberId(gymId);
    let referralCode = generateReferralCode(data.name);

    // Ensure referral code is unique
    const existing = await memberRepository.findByReferralCode(referralCode);
    if (existing) {
      referralCode = generateReferralCode(data.name + Date.now());
    }

    // 2. Validate referral code if provided
    let referredBy: string | undefined;
    if (data.referredByCode) {
      const referrer = await memberRepository.findByReferralCode(data.referredByCode);
      if (!referrer) {
        throw new AppError('Invalid referral code', 400);
      }
      referredBy = data.referredByCode;
    }

    // 3. Create user account for the member
    const defaultPassword = `Welcome@${new Date().getFullYear()}`;
    const passwordHash = await bcrypt.hash(defaultPassword, SALT_ROUNDS);

    // Assuming name is split into firstName and lastName
    const nameParts = data.name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    const result = await prisma.$transaction(async (tx: any) => {
      // Find member role id
      const role = await tx.role.findUnique({ where: { name: 'MEMBER' } });
      if (!role) throw new AppError('Role not found', 500);

      // Create user
      const user = await tx.user.create({
        data: {
          gymId,
          branchId: data.branchId || branchId,
          firstName,
          lastName,
          email: data.email,
          phone: data.phone,
          passwordHash,
          isActive: true,
          roles: {
            create: {
              roleId: role.id
            }
          }
        },
      });

      // Create member profile
      const memberProfile = await tx.memberProfile.create({
        data: {
          gymId,
          branchId: data.branchId || branchId,
          userId: user.id,
          memberId,
          referralCode,
          referredBy,
          source: data.source,
          gender: data.gender,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
          bloodGroup: data.bloodGroup,
          emergencyContact: data.emergencyContact,
          emergencyName: data.emergencyName,
          address: data.address,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          weight: data.weight,
          height: data.height,
          medicalConditions: data.medicalConditions,
          fitnessGoal: data.fitnessGoal,
        },
      });

      // Initialize XP record
      await tx.memberXP.create({
        data: {
          gymId,
          memberId: memberProfile.id,
          totalXp: 0,
          level: 'BRONZE',
          currentStreak: 0,
          longestStreak: 0,
        },
      });

      // Track referral
      if (referredBy) {
        await tx.referral.create({
          data: {
            gymId,
            referrerId: referredBy, // We'll resolve this properly
            referredId: user.id,
            referralCode: referredBy,
            status: 'SIGNED_UP',
          },
        });
      }

      // If plan provided, assign membership
      if (data.planId && data.startDate) {
        const plan = await tx.membershipPlan.findFirst({
          where: { id: data.planId, gymId, deletedAt: null },
        });
        if (!plan) throw new AppError('Plan not found', 404);

        const startDate = new Date(data.startDate);
        const endDate = addDays(startDate, plan.durationInDays);

        await tx.memberMembership.create({
          data: {
            gymId,
            memberProfileId: memberProfile.id,
            planId: plan.id,
            status: 'ACTIVE',
            startDate,
            endDate,
            paidAmount: data.paidAmount || plan.discountedPrice || plan.price,
            discountAmount: data.discountAmount || 0,
          },
        });
      }

      return memberProfile;
    });

    logger.info('Member created', { gymId, memberId, memberProfileId: result.id });
    return this.getById(result.id, gymId);
  }

  async update(memberProfileId: string, gymId: string, data: Record<string, any>) {
    const member = await memberRepository.findById(memberProfileId, gymId);
    if (!member) throw new AppError('Member not found', 404);

    // Update user name/phone if provided
    if (data.name || data.phone) {
      const nameParts = data.name ? (data.name as string).split(' ') : null;
      const firstName = nameParts ? nameParts[0] : undefined;
      const lastName = nameParts ? nameParts.slice(1).join(' ') || '' : undefined;

      await prisma.user.update({
        where: { id: member.userId },
        data: {
          ...(firstName !== undefined && { firstName }),
          ...(lastName !== undefined && { lastName }),
          ...(data.phone && { phone: data.phone as string }),
        },
      });
    }

    // Update profile
    const profileData = { ...data } as any;
delete profileData.name;
delete profileData.phone;
    if (profileData.dateOfBirth) {
      profileData.dateOfBirth = new Date(profileData.dateOfBirth);
    }

    const updated = await memberRepository.update(memberProfileId, gymId, profileData);
    if (!updated) throw new AppError('Member not found', 404);

    logger.info('Member updated', { gymId, memberProfileId });
    return this.getById(memberProfileId, gymId);
  }

  async delete(memberProfileId: string, gymId: string) {
    await memberRepository.softDelete(memberProfileId, gymId);
    logger.info('Member deleted (soft)', { gymId, memberProfileId });
  }

  // ─── Membership Operations ────────────────────────────────

  async assignPlan(memberProfileId: string, gymId: string, data: Record<string, any>) {
    const member = await memberRepository.findById(memberProfileId, gymId);
    if (!member) throw new AppError('Member not found', 404);

    // Check if already has active membership
    const activeMembership = await memberRepository.getActiveMembership(memberProfileId);
    if (activeMembership) {
      throw new AppError('Member already has an active membership. Renew or cancel first.', 409);
    }

    const plan = await planRepository.findById(data.planId, gymId);
    if (!plan) throw new AppError('Plan not found', 404);

    const startDate = new Date(data.startDate);
    const endDate = addDays(startDate, plan.durationInDays);

    const membership = await memberRepository.createMembership({
      gymId,
      memberProfileId,
      planId: plan.id,
      startDate,
      endDate,
      paidAmount: data.paidAmount,
      discountAmount: data.discountAmount || 0,
      status: 'ACTIVE',
      notes: data.notes,
    });

    logger.info('Plan assigned to member', { gymId, memberProfileId, planId: plan.id });
    return membership;
  }

  async freezeMembership(memberProfileId: string, gymId: string, freezeDays: number, reason?: string) {
    const membership = await memberRepository.getActiveMembership(memberProfileId);
    if (!membership) throw new AppError('No active membership found', 404);

    if (membership.status === 'FROZEN') {
      throw new AppError('Membership is already frozen', 409);
    }

    if (membership.freezeCount >= membership.plan.maxFreezes) {
      throw new AppError(`Maximum freeze limit (${membership.plan.maxFreezes}) reached`, 422);
    }

    if (freezeDays > membership.plan.freezeDaysLimit) {
      throw new AppError(`Cannot freeze for more than ${membership.plan.freezeDaysLimit} days`, 422);
    }

    const freezeStartDate = new Date();
    const freezeEndDate = addDays(freezeStartDate, freezeDays);
    const newEndDate = addDays(membership.endDate, freezeDays);

    await memberRepository.updateMembership(membership.id, {
      status: 'FROZEN',
      freezeCount: membership.freezeCount + 1,
      freezeStartDate,
      freezeEndDate,
      totalFreezeDays: membership.totalFreezeDays + freezeDays,
      endDate: newEndDate,
      notes: reason ? `${membership.notes || ''}\nFrozen: ${reason}`.trim() : membership.notes,
    });

    logger.info('Membership frozen', { memberProfileId, freezeDays });
    return this.getById(memberProfileId, gymId);
  }

  async unfreezeMembership(memberProfileId: string, gymId: string) {
    const membership = await memberRepository.getActiveMembership(memberProfileId);
    if (!membership) throw new AppError('No active membership found', 404);

    if (membership.status !== 'FROZEN') {
      throw new AppError('Membership is not frozen', 409);
    }

    await memberRepository.updateMembership(membership.id, {
      status: 'ACTIVE',
      freezeStartDate: null,
      freezeEndDate: null,
    });

    logger.info('Membership unfrozen', { memberProfileId });
    return this.getById(memberProfileId, gymId);
  }

  async renewMembership(memberProfileId: string, gymId: string, data: Record<string, any>) {
    const member = await memberRepository.findById(memberProfileId, gymId);
    if (!member) throw new AppError('Member not found', 404);

    // Expire current membership if exists
    const current = await memberRepository.getActiveMembership(memberProfileId);
    if (current) {
      await memberRepository.updateMembership(current.id, {
        status: 'EXPIRED',
        actualEndDate: new Date(),
      });
    }

    const plan = await planRepository.findById(data.planId, gymId);
    if (!plan) throw new AppError('Plan not found', 404);

    // Start from today or from current end date (whichever is later)
    const startDate = current && current.endDate > new Date()
      ? current.endDate
      : new Date();
    const endDate = addDays(startDate, plan.durationInDays);

    const membership = await memberRepository.createMembership({
      gymId,
      memberProfileId,
      planId: plan.id,
      startDate,
      endDate,
      paidAmount: data.paidAmount,
      discountAmount: data.discountAmount || 0,
      status: 'ACTIVE',
      notes: data.notes,
    });

    logger.info('Membership renewed', { memberProfileId, planId: plan.id });
    return membership;
  }

  async cancelMembership(memberProfileId: string, gymId: string, reason?: string) {
    const membership = await memberRepository.getActiveMembership(memberProfileId);
    if (!membership) throw new AppError('No active membership found', 404);

    await memberRepository.updateMembership(membership.id, {
      status: 'CANCELLED',
      cancelledAt: new Date(),
      cancelReason: reason,
    });

    logger.info('Membership cancelled', { memberProfileId });
    return this.getById(memberProfileId, gymId);
  }

  // ─── Notes ────────────────────────────────────────────────

  async addNote(memberProfileId: string, gymId: string, createdById: string, content: string, isPrivate: boolean) {
    await memberRepository.addNote({ gymId, memberProfileId, createdById, content, isPrivate });
    logger.info('Note added', { memberProfileId });
    return this.getById(memberProfileId, gymId);
  }

  // ─── Trainer Assignment ───────────────────────────────────

  async assignTrainer(memberProfileId: string, gymId: string, trainerId: string, assignedById: string, notes?: string) {
    // Verify trainer exists and has TRAINER role
    const trainer = await prisma.user.findFirst({
      where: { 
        id: trainerId, 
        gymId, 
        deletedAt: null,
        roles: { some: { role: { name: 'TRAINER' } } }
      },
    });
    if (!trainer) throw new AppError('Trainer not found', 404);

    await memberRepository.assignTrainer({ gymId, memberProfileId, trainerId, assignedById, notes });
    logger.info('Trainer assigned', { memberProfileId, trainerId });
    return this.getById(memberProfileId, gymId);
  }

  async removeTrainer(memberProfileId: string, gymId: string) {
    await memberRepository.removeTrainerAssignment(memberProfileId);
    logger.info('Trainer removed', { memberProfileId });
    return this.getById(memberProfileId, gymId);
  }

  // ─── Stats ────────────────────────────────────────────────

  async getStats(gymId: string, branchId?: string) {
    return memberRepository.getStats(gymId, branchId);
  }
}

export const memberService = new MemberService();
