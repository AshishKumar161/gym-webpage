import { Prisma, Session } from '@prisma/client';
import { prisma } from '../server.js';

export class SessionRepository {
  static async createSession(data: Prisma.SessionUncheckedCreateInput) {
    return prisma.session.create({ data });
  }

  static async findSessionByToken(refreshToken: string) {
    return prisma.session.findUnique({
      where: { refreshToken },
      include: { user: { include: { roles: { include: { role: true } } } } },
    });
  }

  static async deleteSession(refreshToken: string) {
    return prisma.session.delete({
      where: { refreshToken },
    });
  }

  static async deleteAllUserSessions(userId: string) {
    return prisma.session.deleteMany({
      where: { userId },
    });
  }
}
