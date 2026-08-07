import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../utils/AppError.js';
import { UserRepository } from '../repositories/user.repository.js';
import { SessionRepository } from '../repositories/session.repository.js';
import { Prisma, RoleType } from '@prisma/client';
import prisma from '../config/prisma.js';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'supersecret_development_key';
const ACCESS_TOKEN_EXPIRATION = '15m';
const REFRESH_TOKEN_EXPIRATION_DAYS = 7;

export class AuthService {
  static generateAccessToken(user: any) {
    const payload = {
      id: user.id,
      branchId: user.branchId,
      roles: user.roles.map((r: any) => r.role.name),
    };
    return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRATION });
  }

  static async register(data: any) {
    const existingUser = await UserRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError('Email is already in use', 409);
    }

    // Split name if provided and firstName is missing
    if (data.name && !data.firstName) {
      const parts = data.name.trim().split(' ');
      data.firstName = parts[0];
      data.lastName = parts.length > 1 ? parts.slice(1).join(' ') : '';
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Handle name splitting: frontend sends 'name', validator allows both
    let firstName = data.firstName;
    let lastName = data.lastName || '';
    if (!firstName && data.name) {
      const parts = data.name.trim().split(/\s+/);
      firstName = parts[0];
      lastName = parts.slice(1).join(' ') || '';
    }
    if (!firstName) firstName = 'User';

    const memberRole = await prisma.role.findUnique({ where: { name: RoleType.MEMBER } });
    if (!memberRole) {
      throw new AppError('Default role not found. Please run database seed first.', 500);
    }

    const newUser = await UserRepository.create({
      email: data.email,
      passwordHash,
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      phone: data.phone,
      branch: data.branchId ? { connect: { id: data.branchId } } : undefined,
      roles: {
        create: [{ roleId: memberRole.id }]
      }
    });

    // Auto-login: generate tokens
    const accessToken = this.generateAccessToken(newUser);
    const refreshToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRATION_DAYS);

    await SessionRepository.createSession({
      userId: newUser.id,
      refreshToken,
      expiresAt,
    });

    // Auto-login after registration
    const accessToken = this.generateAccessToken({ ...newUser, roles: [{ role: memberRole }] });
    const refreshToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRATION_DAYS);

    await SessionRepository.createSession({
      userId: newUser.id,
      refreshToken,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        name: `${newUser.firstName} ${newUser.lastName}`.trim(),
        role: 'member',
        roles: ['MEMBER'],
      },
    };
  }

  static async login(email: string, passwordPlain: string, ipAddress?: string, userAgent?: string) {
    const user = await UserRepository.findByEmail(email);

    if (!user || !user.isActive) {
      throw new AppError('Invalid email or password', 401);
    }

    const isPasswordValid = await bcrypt.compare(passwordPlain, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = uuidv4();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRATION_DAYS);

    await SessionRepository.createSession({
      userId: user.id,
      refreshToken,
      ipAddress,
      userAgent,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`.trim(),
        role: user.roles[0]?.role.name.toLowerCase() || 'member',
        roles: user.roles.map(r => r.role.name),
      },
    };
  }

  static async logout(refreshToken: string) {
    if (refreshToken) {
      await SessionRepository.deleteSession(refreshToken);
    }
  }

  static async refreshAccessToken(refreshToken: string) {
    const session = await SessionRepository.findSessionByToken(refreshToken);

    if (!session || session.expiresAt < new Date()) {
      throw new AppError('Session expired or invalid', 401);
    }

    const user = session.user;
    if (!user.isActive) {
      throw new AppError('User account is inactive', 403);
    }

    // Refresh Token Rotation (Delete old, issue new)
    await SessionRepository.deleteSession(refreshToken);
    const newRefreshToken = uuidv4();
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRATION_DAYS);

    await SessionRepository.createSession({
      userId: user.id,
      refreshToken: newRefreshToken,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      expiresAt,
    });

    const newAccessToken = this.generateAccessToken(user);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`.trim(),
        role: user.roles[0]?.role.name.toLowerCase() || 'member',
        roles: user.roles.map((r: any) => r.role.name),
      },
    };
  }

  static async changePassword(userId: string, oldPasswordPlain: string, newPasswordPlain: string) {
    const user = await UserRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    const isPasswordValid = await bcrypt.compare(oldPasswordPlain, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Invalid old password', 401);
    }

    const newPasswordHash = await bcrypt.hash(newPasswordPlain, 10);
    await UserRepository.updatePassword(userId, newPasswordHash);

    // Revoke all existing sessions to force re-login on other devices
    await SessionRepository.deleteAllUserSessions(userId);
  }

  static async getFullProfile(userId: string) {
    const user = await UserRepository.findUserWithBranch(userId);
    if (!user) throw new AppError('User not found', 404);

    const permissions = new Set<string>();

    for (const userRole of user.roles) {
      const rolePermissions = await UserRepository.getPermissionsForRole(userRole.role.name);
      for (const rp of rolePermissions) {
        permissions.add(`${rp.permission.action}:${rp.permission.resource}`);
      }
    }

    return {
      ...user,
      permissions: Array.from(permissions),
    };
  }

  static async forgotPassword(email: string) {
    const user = await UserRepository.findByEmail(email);

    // Always return success to prevent email enumeration
    if (!user) {
      return;
    }

    if (!user.isActive) {
      return;
    }

    const crypto = await import('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await UserRepository.setResetToken(user.id, hashedToken, expires);

    // In a real app, send email here. For development, log the token.
    if (process.env.NODE_ENV === 'development') {
      console.log(`\n[DEV] Password reset token for ${email}: ${resetToken}\n`);
    }
  }

  static async resetPassword(token: string, newPasswordPlain: string) {
    const crypto = await import('crypto');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await UserRepository.findByResetToken(hashedToken);
    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    const passwordHash = await bcrypt.hash(newPasswordPlain, 10);
    await UserRepository.updatePassword(user.id, passwordHash);
    await UserRepository.clearResetToken(user.id);

    // Revoke all refresh tokens
    await SessionRepository.deleteAllUserSessions(user.id);
  }

  static async sendVerificationEmail(userId: string) {
    const user = await UserRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    if (user.emailVerifiedAt) {
      throw new AppError('Email is already verified', 400);
    }

    const crypto = await import('crypto');
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await UserRepository.setEmailVerificationToken(userId, hashedToken, expires);

    if (process.env.NODE_ENV === 'development') {
      console.log(`\n[DEV] Email verification token for ${user.email}: ${verificationToken}\n`);
    }
  }

  static async verifyEmail(token: string) {
    const crypto = await import('crypto');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await UserRepository.findByEmailVerificationToken(hashedToken);
    if (!user) {
      throw new AppError('Invalid or expired verification token', 400);
    }

    if (user.emailVerifiedAt) {
      throw new AppError('Email is already verified', 400);
    }

    await UserRepository.markEmailVerified(user.id);
  }

  static async resendVerification(email: string) {
    const user = await UserRepository.findByEmail(email);
    if (!user) return; // Silent fail to prevent enumeration

    if (user.emailVerifiedAt) {
      throw new AppError('Email is already verified', 400);
    }

    await this.sendVerificationEmail(user.id);
  }
}
