import { Prisma, User } from '@prisma/client';
import { prisma } from '../server.js';

export class UserRepository {
  static async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: { role: true },
        },
      },
    });
  }

  static async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        roles: {
          include: { role: true },
        },
      },
    });
  }

  static async create(data: Prisma.UserCreateInput) {
    return prisma.user.create({
      data,
      include: {
        roles: {
          include: { role: true },
        },
      },
    });
  }

  static async updatePassword(id: string, passwordHash: string) {
    return prisma.user.update({
      where: { id },
      data: {
        passwordHash,
        lastPasswordChangeAt: new Date(),
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });
  }

  // ─── Password Reset ──────────────────────────────────────

  static async setResetToken(userId: string, token: string, expires: Date): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        resetPasswordToken: token,
        resetPasswordExpires: expires,
      },
    });
  }

  static async findByResetToken(token: string) {
    return prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gt: new Date() },
        deletedAt: null,
      },
    });
  }

  static async clearResetToken(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });
  }

  // ─── Email Verification ──────────────────────────────────

  static async setEmailVerificationToken(userId: string, token: string, expires: Date): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        emailVerificationToken: token,
        emailVerificationExpires: expires,
      },
    });
  }

  static async findByEmailVerificationToken(token: string) {
    return prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: { gt: new Date() },
        deletedAt: null,
      },
    });
  }

  static async markEmailVerified(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        emailVerifiedAt: new Date(),
        isActive: true, // Equivalent to status: ACTIVE
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });
  }

  // ─── Full User Profile ───────────────────────────────────

  static async findUserWithBranch(userId: string) {
    return prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        isActive: true,
        avatarUrl: true,
        emailVerifiedAt: true,
        lastPasswordChangeAt: true,
        createdAt: true,
        roles: {
          select: { role: true },
        },
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
  }

  // ─── Permissions ─────────────────────────────────────────

  static async getPermissionsForRole(roleName: string) {
    return prisma.rolePermission.findMany({
      where: { role: roleName as any },
      include: { permission: true },
    });
  }
}
