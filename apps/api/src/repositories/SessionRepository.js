import prisma from '../config/prisma.js';

export class SessionRepository {
  static async create(sessionData) {
    return await prisma.session.create({
      data: sessionData
    });
  }

  static async findActiveByUserIdAndHash(userId, tokenHash) {
    return await prisma.session.findFirst({
      where: {
        userId,
        refreshTokenHash: tokenHash,
        isRevoked: false,
        expiresAt: { gt: new Date() }
      }
    });
  }

  static async revokeByTokenHash(userId, tokenHash) {
    return await prisma.session.updateMany({
      where: { userId, refreshTokenHash: tokenHash },
      data: { isRevoked: true }
    });
  }

  static async revokeAllByUserId(userId) {
    return await prisma.session.updateMany({
      where: { userId },
      data: { isRevoked: true }
    });
  }

  static async findManyActiveByUserId(userId) {
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
  }

  static async revokeById(sessionId, userId) {
    return await prisma.session.updateMany({
      where: { id: sessionId, userId },
      data: { isRevoked: true }
    });
  }
}
