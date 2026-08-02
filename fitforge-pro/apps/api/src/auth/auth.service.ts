import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../services/email.service';
import * as argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Role } from '@prisma/client';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly email: EmailService,
  ) {}

  // ─── Register ─────────────────────────────────────────────────────────────
  async register(dto: RegisterDto, ip: string, userAgent: string) {
    // Check for existing user
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { phone: dto.phone }] },
    });

    if (existing) {
      if (existing.email === dto.email) {
        throw new ConflictException('Email address is already registered');
      }
      throw new ConflictException('Phone number is already registered');
    }

    // Hash password
    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    // Generate email verification token
    const emailVerifyToken = uuidv4();
    const emailVerifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Handle referral code
    let referredByUserId: string | undefined;
    if (dto.referralCode) {
      const referralCode = await this.prisma.referralCode.findUnique({
        where: { code: dto.referralCode.toUpperCase() },
      });
      if (referralCode) {
        referredByUserId = referralCode.userId;
      }
    }

    // Create user
    const user = await this.prisma.user.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email.toLowerCase(),
        phone: dto.phone,
        passwordHash,
        role: Role.MEMBER,
        emailVerifyToken,
        emailVerifyExpiry,
        referredBy: referredByUserId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    // Create referral code for new user
    await this.prisma.referralCode.create({
      data: {
        userId: user.id,
        code: this.generateReferralCode(user.firstName, user.id),
      },
    });

    // Award referral reward to referrer
    if (referredByUserId) {
      await this.prisma.rewardPoint.create({
        data: {
          userId: referredByUserId,
          points: 500,
          description: `Referral bonus: ${user.firstName} ${user.lastName} joined`,
          type: 'EARNED',
          referenceId: user.id,
        },
      });
    }

    // Audit log
    await this.auditLog(user.id, 'USER_REGISTER', 'User', user.id, ip, userAgent, true);

    // Send verification email
    try {
      await this.email.sendVerificationEmail(user, emailVerifyToken);
    } catch (err) {
      this.logger.warn(`Failed to send verification email to ${user.email}`, err);
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role, ip, userAgent);

    return { user, tokens };
  }

  // ─── Login ────────────────────────────────────────────────────────────────
  async login(dto: LoginDto, ip: string, userAgent: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    // Generic error to prevent user enumeration
    const invalidCredentialsError = new UnauthorizedException(
      'Invalid email or password',
    );

    if (!user) {
      throw invalidCredentialsError;
    }

    // Check if account is active
    if (!user.isActive) {
      throw new ForbiddenException('Your account has been deactivated. Please contact support.');
    }

    // Check lockout
    if (user.isLocked && user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / (1000 * 60),
      );
      throw new ForbiddenException(
        `Account locked due to too many failed attempts. Try again in ${minutesLeft} minutes.`,
      );
    }

    // Unlock expired lockout
    if (user.isLocked && (!user.lockedUntil || user.lockedUntil <= new Date())) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { isLocked: false, loginAttempts: 0, lockedUntil: null },
      });
    }

    // Verify password
    if (!user.passwordHash) {
      throw new UnauthorizedException('Please login with Google instead');
    }

    const isValid = await argon2.verify(user.passwordHash, dto.password);

    if (!isValid) {
      const newAttempts = user.loginAttempts + 1;
      const shouldLock = newAttempts >= MAX_LOGIN_ATTEMPTS;

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: newAttempts,
          isLocked: shouldLock,
          lockedUntil: shouldLock
            ? new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000)
            : null,
        },
      });

      await this.auditLog(user.id, 'LOGIN_FAILED', 'User', user.id, ip, userAgent, false, 'Invalid password');

      if (shouldLock) {
        throw new ForbiddenException(
          `Too many failed attempts. Account locked for ${LOCKOUT_DURATION_MINUTES} minutes.`,
        );
      }

      throw invalidCredentialsError;
    }

    // Successful login — reset attempts
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        isLocked: false,
        lockedUntil: null,
        lastLoginAt: new Date(),
        lastLoginIp: ip,
      },
    });

    await this.auditLog(user.id, 'USER_LOGIN', 'User', user.id, ip, userAgent, true);

    const tokens = await this.generateTokens(user.id, user.email, user.role, ip, userAgent);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        avatarUrl: user.avatarUrl,
      },
      tokens,
    };
  }

  // ─── Logout ───────────────────────────────────────────────────────────────
  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await this.prisma.refreshToken.updateMany({
        where: { userId, token: refreshToken },
        data: { isRevoked: true },
      });
    } else {
      // Revoke all tokens for this user
      await this.prisma.refreshToken.updateMany({
        where: { userId },
        data: { isRevoked: true },
      });
    }
  }

  // ─── Refresh Tokens ───────────────────────────────────────────────────────
  async refreshTokens(
    refreshToken: string,
    ip: string,
  ) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    // Verify refresh token
    let payload: { sub: string; email: string; role: Role; jti: string };
    try {
      payload = this.jwt.verify(refreshToken, {
        secret: this.config.get<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Check DB
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken || storedToken.isRevoked || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token is revoked or expired');
    }

    // Revoke old token (rotation)
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });

    const user = storedToken.user;
    const tokens = await this.generateTokens(user.id, user.email, user.role, ip);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
      tokens,
    };
  }

  // ─── Forgot Password ──────────────────────────────────────────────────────
  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Don't reveal if email exists
    if (!user) return;

    const resetToken = uuidv4();
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry },
    });

    try {
      await this.email.sendPasswordResetEmail(user, resetToken);
    } catch (err) {
      this.logger.warn(`Failed to send reset email to ${user.email}`, err);
    }
  }

  // ─── Reset Password ───────────────────────────────────────────────────────
  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: dto.token,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Password reset token is invalid or has expired');
    }

    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
        loginAttempts: 0,
        isLocked: false,
        lockedUntil: null,
      },
    });

    // Revoke all refresh tokens
    await this.prisma.refreshToken.updateMany({
      where: { userId: user.id },
      data: { isRevoked: true },
    });
  }

  // ─── Verify Email ─────────────────────────────────────────────────────────
  async verifyEmail(token: string) {
    if (!token) throw new BadRequestException('Verification token is required');

    const user = await this.prisma.user.findFirst({
      where: {
        emailVerifyToken: token,
        emailVerifyExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Email verification token is invalid or expired');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerifyToken: null,
        emailVerifyExpiry: null,
      },
    });

    // Award points for email verification
    await this.prisma.rewardPoint.create({
      data: {
        userId: user.id,
        points: 100,
        description: 'Email verified',
        type: 'EARNED',
      },
    });
  }

  // ─── Google OAuth ─────────────────────────────────────────────────────────
  async googleLogin(googleUser: any, ip: string) {
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { googleId: googleUser.googleId },
          { email: googleUser.email },
        ],
      },
    });

    if (!user) {
      // Create new user from Google
      user = await this.prisma.user.create({
        data: {
          email: googleUser.email.toLowerCase(),
          firstName: googleUser.firstName,
          lastName: googleUser.lastName,
          googleId: googleUser.googleId,
          avatarUrl: googleUser.avatarUrl,
          isEmailVerified: true, // Google verifies email
          role: Role.MEMBER,
        },
      });

      await this.prisma.referralCode.create({
        data: {
          userId: user.id,
          code: this.generateReferralCode(user.firstName, user.id),
        },
      });
    } else if (!user.googleId) {
      // Link Google to existing account
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: googleUser.googleId,
          isEmailVerified: true,
          avatarUrl: user.avatarUrl ?? googleUser.avatarUrl,
        },
      });
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), lastLoginIp: ip },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role, ip);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
      tokens,
    };
  }

  // ─── Get Me ───────────────────────────────────────────────────────────────
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        avatarUrl: true,
        isEmailVerified: true,
        isTwoFactorEnabled: true,
        dateOfBirth: true,
        gender: true,
        address: true,
        city: true,
        state: true,
        country: true,
        createdAt: true,
        memberships: {
          where: { status: 'ACTIVE' },
          select: {
            id: true,
            status: true,
            endDate: true,
            qrCode: true,
            plan: {
              select: { name: true, color: true },
            },
          },
          take: 1,
          orderBy: { endDate: 'desc' },
        },
        rewardPoints: {
          select: { points: true, type: true },
        },
      },
    });

    if (!user) throw new UnauthorizedException('User not found');

    const totalPoints = user.rewardPoints
      .filter((p) => p.type === 'EARNED')
      .reduce((acc, p) => acc + p.points, 0);
    const redeemedPoints = user.rewardPoints
      .filter((p) => p.type === 'REDEEMED')
      .reduce((acc, p) => acc + p.points, 0);

    return {
      ...user,
      rewardPoints: totalPoints - redeemedPoints,
    };
  }

  // ─── Internal Helpers ─────────────────────────────────────────────────────
  async validateUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId, isActive: true },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        isActive: true,
        isLocked: true,
      },
    });
  }

  private async generateTokens(
    userId: string,
    email: string,
    role: Role,
    ip: string,
    userAgent?: string,
  ) {
    const jti = uuidv4();

    const accessToken = this.jwt.sign(
      { sub: userId, email, role, jti },
      {
        secret: this.config.get<string>('jwt.accessSecret'),
        expiresIn: this.config.get<string>('jwt.accessExpiresIn', '15m') as any,
      },
    );

    const refreshToken = this.jwt.sign(
      { sub: userId, email, role, jti: uuidv4() },
      {
        secret: this.config.get<string>('jwt.refreshSecret'),
        expiresIn: this.config.get<string>('jwt.refreshExpiresIn', '7d') as any,
      },
    );

    // Store refresh token in DB
    const refreshExpiry = new Date();
    refreshExpiry.setDate(refreshExpiry.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: refreshToken,
        expiresAt: refreshExpiry,
        ipAddress: ip,
        deviceInfo: userAgent,
      },
    });

    // Clean up expired tokens
    await this.prisma.refreshToken.deleteMany({
      where: {
        userId,
        OR: [
          { expiresAt: { lt: new Date() } },
          { isRevoked: true },
        ],
      },
    });

    return { accessToken, refreshToken };
  }

  private generateReferralCode(firstName: string, userId: string): string {
    const prefix = firstName.slice(0, 4).toUpperCase().padEnd(4, 'X');
    const suffix = userId.slice(-4).toUpperCase();
    return `${prefix}${suffix}`;
  }

  private async auditLog(
    userId: string,
    action: string,
    resource: string,
    resourceId: string,
    ip: string,
    userAgent: string,
    success: boolean,
    errorMessage?: string,
  ) {
    try {
      await this.prisma.auditLog.create({
        data: { userId, action, resource, resourceId, ipAddress: ip, userAgent, success, errorMessage },
      });
    } catch (err) {
      this.logger.warn('Failed to create audit log', err);
    }
  }
}
