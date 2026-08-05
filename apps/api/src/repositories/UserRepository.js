import prisma from '../config/prisma.js';

export class UserRepository {
  static async findByEmail(email) {
    if (!email) return null;
    const normalizedEmail = email.toLowerCase().trim();
    return await prisma.user.findFirst({
      where: { email: normalizedEmail, isDeleted: false }
    });
  }

  static async findById(id) {
    if (!id) return null;
    return await prisma.user.findFirst({
      where: { id, isDeleted: false },
      select: {
        id: true, name: true, email: true, phone: true, avatar: true,
        role: true, emailVerified: true, lastLogin: true, createdAt: true, updatedAt: true
      }
    });
  }

  static async findByResetToken(tokenHash) {
    if (!tokenHash) return null;
    return await prisma.user.findFirst({
      where: {
        resetPasswordToken: tokenHash,
        resetPasswordExpires: { gt: new Date() },
        isDeleted: false
      }
    });
  }

  static async create(userData) {
    return await prisma.user.create({
      data: userData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  static async update(id, updateData) {
    return await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true, name: true, email: true, phone: true, avatar: true,
        role: true, emailVerified: true, lastLogin: true, createdAt: true, updatedAt: true
      }
    });
  }

  static async list({ skip = 0, take = 10, role = null }) {
    const where = { isDeleted: false };
    if (role) {
      where.role = role.toUpperCase();
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          emailVerified: true,
          lastLogin: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);
    return { users, total };
  }

  static async count() {
    return await prisma.user.count({ where: { isDeleted: false } });
  }
}
