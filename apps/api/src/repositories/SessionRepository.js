import prisma from '../config/prisma.js';
import Session from '../models/Session.js';

export class SessionRepository {
  static async create(sessionData) {
    try {
      return await prisma.session.create({
        data: sessionData
      });
    } catch {
      return await Session.create(sessionData);
    }
  }

  static async findActiveByUserIdAndHash(userId, tokenHash) {
    try {
      return await prisma.session.findFirst({
        where: {
          userId,
          refreshTokenHash: tokenHash,
          isRevoked: false,
          expiresAt: { gt: new Date() }
        }
      });
    } catch {
      return await Session.findOne({
        userId,
        refreshTokenHash: tokenHash,
        isRevoked: false,
        expiresAt: { $gt: new Date() }
      });
    }
  }

  static async revokeByTokenHash(userId, tokenHash) {
    try {
      return await prisma.session.updateMany({
        where: { userId, refreshTokenHash: tokenHash },
        data: { isRevoked: true }
      });
    } catch {
      return await Session.updateMany(
        { userId, refreshTokenHash: tokenHash },
        { isRevoked: true }
      );
    }
  }

  static async revokeAllByUserId(userId) {
    try {
      return await prisma.session.updateMany({
        where: { userId },
        data: { isRevoked: true }
      });
    } catch {
      return await Session.updateMany({ userId }, { isRevoked: true });
    }
  }

  static async findManyActiveByUserId(userId) {
    try {
      return await prisma.session.findMany({
        where: {
          userId,
          isRevoked: false,
          expiresAt: { gt: new Date() }
        },
        select: {
          id: true,
          device: true,
          browser: true,
          os: true,
          ipAddress: true,
          loginTime: true,
          lastActivity: true,
          expiresAt: true
        },
        orderBy: { lastActivity: 'desc' }
      });
    } catch {
      return await Session.find({
        userId,
        isRevoked: false,
        expiresAt: { $gt: new Date() }
      }).select('-refreshTokenHash -userAgent').sort({ lastActivity: -1 });
    }
  }

  static async revokeById(sessionId, userId) {
    try {
      return await prisma.session.updateMany({
        where: { id: sessionId, userId },
        data: { isRevoked: true }
      });
    } catch {
      return await Session.updateOne({ _id: sessionId, userId }, { isRevoked: true });
    }
  }
}
