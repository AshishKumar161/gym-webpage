import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';
import logger from '../utils/logger.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { SessionRepository } from '../repositories/SessionRepository.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} from '../utils/jwt.js';
import { parseUserAgent } from '../utils/deviceParser.js';
import { ConflictError, AuthenticationError, ValidationError, NotFoundError } from '../errors/AppError.js';

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

export class AuthService {
  /**
   * Register a new user account.
   */
  static async registerUser({ name, email, password, phone, avatar, role, ip = '', userAgent = '' }) {
    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('Email address is already registered.');
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    let userRole = 'MEMBER';
    if (role && ['MEMBER', 'TRAINER', 'ADMIN', 'member', 'trainer', 'admin'].includes(role)) {
      userRole = role.toUpperCase();
    }

    // Generate 6-digit OTP code for email verification
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const user = await UserRepository.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone || '',
      avatar: avatar || '',
      role: userRole,
      otpCode,
      otpExpires
    });

    // Create Audit Log entry safely
    try {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          event: 'USER_REGISTERED',
          ipAddress: ip || '',
          userAgent: userAgent || '',
          details: `Registered new user: ${user.email} (${user.role})`
        }
      });
    } catch (err) {
      logger.warn(`[AUDIT_LOG] Non-fatal log failure: ${err.message}`);
    }

    // Generate session & tokens
    const refreshTokenId = crypto.randomUUID();
    const accessToken = generateAccessToken({ id: user.id, role: user.role, email: user.email });
    const refreshToken = generateRefreshToken({ id: user.id }, refreshTokenId);

    const { device, browser, os } = parseUserAgent(userAgent);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await SessionRepository.create({
      userId: user.id,
      refreshTokenId,
      refreshTokenHash: hashToken(refreshToken),
      device,
      browser,
      os,
      ipAddress: ip,
      userAgent,
      expiresAt
    });

    logger.info(`[AUTH] Registered new account ${user.email} (OTP: ${otpCode})`);

    return { user, accessToken, refreshToken, otpCode };
  }

  /**
   * Login user with credentials and rate limiting lockout verification.
   */
  static async loginUser({ email, password, ip = '', userAgent = '' }) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new AuthenticationError('Invalid email or password.');
    }

    if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
      const remaining = Math.ceil((new Date(user.accountLockedUntil) - Date.now()) / 60000);
      throw new AuthenticationError(
        `Account locked due to multiple failed login attempts. Please try again in ${remaining} minute(s).`,
        'ACCOUNT_LOCKED'
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const attempts = (user.failedLoginAttempts || 0) + 1;
      const isLocking = attempts >= 5;
      const lockTime = isLocking ? new Date(Date.now() + 30 * 60 * 1000) : null;

      await UserRepository.update(user.id, {
        failedLoginAttempts: attempts,
        accountLockedUntil: lockTime
      });

      throw new AuthenticationError('Invalid email or password.');
    }

    // Reset login failures on successful login
    const now = new Date();
    await UserRepository.update(user.id, {
      failedLoginAttempts: 0,
      accountLockedUntil: null,
      lastLogin: now,
      lastLoginIp: ip
    });

    const refreshTokenId = crypto.randomUUID();
    const accessToken = generateAccessToken({ id: user.id, role: user.role, email: user.email });
    const refreshToken = generateRefreshToken({ id: user.id }, refreshTokenId);

    const { device, browser, os } = parseUserAgent(userAgent);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await SessionRepository.create({
      userId: user.id,
      refreshTokenId,
      refreshTokenHash: hashToken(refreshToken),
      device,
      browser,
      os,
      ipAddress: ip,
      userAgent,
      expiresAt
    });

    const userPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      avatar: user.avatar || '',
      role: user.role,
      emailVerified: user.emailVerified || false,
      lastLogin: now
    };

    logger.info(`[AUTH] User logged in: ${user.email}`);

    return { user: userPayload, accessToken, refreshToken };
  }

  /**
   * Get current authenticated user profile or restore via refresh cookie.
   */
  static async getMe(userFromReq, refreshTokenCookie) {
    let user = userFromReq;
    let newAccessToken = null;
    let newRefreshToken = null;

    if (!user) {
      if (!refreshTokenCookie) {
        throw new AuthenticationError('Not authenticated.');
      }

      let decoded;
      try {
        decoded = verifyRefreshToken(refreshTokenCookie);
      } catch {
        throw new AuthenticationError('Session expired. Please log in again.', 'SESSION_EXPIRED');
      }

      user = await UserRepository.findById(decoded.id);
      if (!user) {
        throw new AuthenticationError('User not found.');
      }

      const tokenHash = hashToken(refreshTokenCookie);
      const session = await SessionRepository.findActiveByUserIdAndHash(user.id, tokenHash);
      if (!session) {
        throw new AuthenticationError('Session revoked or invalid.', 'SESSION_REVOKED');
      }

      // Rotate tokens
      const refreshTokenId = crypto.randomUUID();
      newAccessToken = generateAccessToken({ id: user.id, role: user.role, email: user.email });
      newRefreshToken = generateRefreshToken({ id: user.id }, refreshTokenId);

      await SessionRepository.revokeByTokenHash(user.id, tokenHash);
      await SessionRepository.create({
        userId: user.id,
        refreshTokenId,
        refreshTokenHash: hashToken(newRefreshToken),
        device: session.device,
        browser: session.browser,
        os: session.os,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
    }

    const userPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      avatar: user.avatar || '',
      role: user.role,
      emailVerified: user.emailVerified || false,
      lastLogin: user.lastLogin
    };

    return { user: userPayload, newAccessToken, newRefreshToken };
  }

  /**
   * Rotate access token and refresh token via valid refresh cookie.
   */
  static async rotateRefreshToken(tokenCookie, ip = '', userAgent = '') {
    if (!tokenCookie) {
      throw new AuthenticationError('Refresh token required.', 'TOKEN_MISSING');
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(tokenCookie);
    } catch {
      throw new AuthenticationError('Refresh token expired or invalid.', 'SESSION_EXPIRED');
    }

    const tokenHash = hashToken(tokenCookie);
    const session = await SessionRepository.findActiveByUserIdAndHash(decoded.id, tokenHash);
    if (!session) {
      throw new AuthenticationError('Session revoked or invalid.', 'SESSION_REVOKED');
    }

    const user = await UserRepository.findById(decoded.id);
    if (!user) {
      throw new AuthenticationError('User account not found.');
    }

    // Revoke old session
    await SessionRepository.revokeByTokenHash(user.id, tokenHash);

    // Issue new session and tokens
    const refreshTokenId = crypto.randomUUID();
    const newAccessToken = generateAccessToken({ id: user.id, role: user.role, email: user.email });
    const newRefreshToken = generateRefreshToken({ id: user.id }, refreshTokenId);

    const { device, browser, os } = parseUserAgent(userAgent);
    await SessionRepository.create({
      userId: user.id,
      refreshTokenId,
      refreshTokenHash: hashToken(newRefreshToken),
      device: device || session.device,
      browser: browser || session.browser,
      os: os || session.os,
      ipAddress: ip || session.ipAddress,
      userAgent: userAgent || session.userAgent,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    const userPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      avatar: user.avatar || '',
      role: user.role,
      emailVerified: user.emailVerified || false
    };

    return { accessToken: newAccessToken, refreshToken: newRefreshToken, user: userPayload };
  }

  /**
   * Verify email OTP code.
   */
  static async verifyOTP({ email, otp }) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundError('User account not found.');
    }

    if (!user.otpCode || user.otpCode !== otp.trim()) {
      throw new ValidationError('Invalid verification OTP code.');
    }

    if (user.otpExpires && user.otpExpires < new Date()) {
      throw new ValidationError('Verification OTP code has expired.');
    }

    await UserRepository.update(user.id, {
      emailVerified: true,
      otpCode: null,
      otpExpires: null
    });

    return { verified: true };
  }

  /**
   * Initiate forgot password process.
   */
  static async forgotPassword({ email }) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      // Prevent account enumeration by returning true
      return { success: true };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(resetToken);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await UserRepository.update(user.id, {
      resetPasswordToken: tokenHash,
      resetPasswordExpires: expiresAt
    });

    logger.info(`[AUTH] Password reset requested for ${user.email} (Token: ${resetToken})`);

    return { success: true, resetToken };
  }

  /**
   * Reset user password using token.
   */
  static async resetPassword({ token, newPassword }) {
    const tokenHash = hashToken(token);
    const user = await UserRepository.findByResetToken(tokenHash);

    if (!user) {
      throw new ValidationError('Invalid or expired password reset token.');
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await UserRepository.update(user.id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
      failedLoginAttempts: 0,
      accountLockedUntil: null
    });

    // Revoke all active sessions on password reset
    await SessionRepository.revokeAllByUserId(user.id);

    logger.info(`[AUTH] Password reset successful for user ${user.email}`);

    return { success: true };
  }

  /**
   * Change current logged-in user password.
   */
  static async changePassword(userId, { currentPassword, newPassword }) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found.');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new ValidationError('Current password is incorrect.');
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await UserRepository.update(user.id, {
      password: hashedPassword
    });

    return { success: true };
  }

  /**
   * Fetch active sessions for a user.
   */
  static async getSessions(userId) {
    return await SessionRepository.findManyActiveByUserId(userId);
  }

  /**
   * Revoke a specific active session.
   */
  static async revokeSession(userId, sessionId) {
    await SessionRepository.revokeById(sessionId, userId);
    return { success: true };
  }

  /**
   * Logout user single session.
   */
  static async logoutUser(userId, refreshTokenCookie) {
    if (userId && refreshTokenCookie) {
      const tokenHash = hashToken(refreshTokenCookie);
      await SessionRepository.revokeByTokenHash(userId, tokenHash);
    }
  }

  /**
   * Logout all user devices.
   */
  static async logoutAllDevices(userId) {
    if (userId) {
      await SessionRepository.revokeAllByUserId(userId);
    }
  }
}
