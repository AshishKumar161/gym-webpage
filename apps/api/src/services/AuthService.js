import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/UserRepository.js';
import { SessionRepository } from '../repositories/SessionRepository.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} from '../utils/jwt.js';
import { parseUserAgent } from '../utils/deviceParser.js';
import { ConflictError, AuthenticationError, ValidationError } from '../errors/AppError.js';

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

export class AuthService {
  static async registerUser({ name, email, password, phone, avatar, role }) {
    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('Email is already registered.');
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    let userRole = 'MEMBER';
    if (role && ['MEMBER', 'TRAINER', 'ADMIN', 'member', 'trainer', 'admin'].includes(role)) {
      userRole = role.toUpperCase();
    }

    const user = await UserRepository.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone || '',
      avatar: avatar || '',
      role: userRole
    });

    return { user };
  }

  static async loginUser({ email, password, ip, userAgent }) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new AuthenticationError('Invalid email or password.');
    }

    const lockedUntil = user.accountLockedUntil || user.lockUntil;
    if (lockedUntil && lockedUntil > new Date()) {
      const remaining = Math.ceil((new Date(lockedUntil) - Date.now()) / 60000);
      throw new AuthenticationError(`Account temporarily locked due to 5 failed attempts. Try again in ${remaining} minute(s).`, 'ACCOUNT_LOCKED');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const attempts = (user.failedLoginAttempts || user.loginAttempts || 0) + 1;
      const isLocking = attempts >= 5;
      const lockTime = isLocking ? new Date(Date.now() + 30 * 60 * 1000) : null;

      await UserRepository.update(user.id || user._id, {
        failedLoginAttempts: attempts,
        accountLockedUntil: lockTime
      });

      throw new AuthenticationError('Invalid email or password.');
    }

    const now = new Date();
    await UserRepository.update(user.id || user._id, {
      failedLoginAttempts: 0,
      accountLockedUntil: null,
      lastLogin: now,
      lastLoginIp: ip
    });

    const userIdStr = user.id || user._id.toString();
    const refreshTokenId = crypto.randomUUID();
    const accessToken = generateAccessToken({ id: userIdStr, role: user.role, email: user.email });
    const refreshToken = generateRefreshToken({ id: userIdStr }, refreshTokenId);

    const { device, browser, os } = parseUserAgent(userAgent);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await SessionRepository.create({
      userId: userIdStr,
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
      id: userIdStr,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      avatar: user.avatar || '',
      role: user.role,
      emailVerified: user.emailVerified || false,
      lastLogin: now
    };

    return { user: userPayload, accessToken, refreshToken };
  }

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
      const session = await SessionRepository.findActiveByUserIdAndHash(user.id || user._id, tokenHash);
      if (!session) {
        throw new AuthenticationError('Session revoked or invalid.');
      }

      const userIdStr = user.id || user._id.toString();
      const refreshTokenId = crypto.randomUUID();
      newAccessToken = generateAccessToken({ id: userIdStr, role: user.role, email: user.email });
      newRefreshToken = generateRefreshToken({ id: userIdStr }, refreshTokenId);
    }

    const userIdStr = user.id || user._id.toString();
    const userPayload = {
      id: userIdStr,
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

  static async logoutUser(userId, refreshTokenCookie) {
    if (userId && refreshTokenCookie) {
      const tokenHash = hashToken(refreshTokenCookie);
      await SessionRepository.revokeByTokenHash(userId, tokenHash);
    }
  }

  static async logoutAllDevices(userId) {
    if (userId) {
      await SessionRepository.revokeAllByUserId(userId);
    }
  }
}
