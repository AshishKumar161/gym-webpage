import prisma from '../config/prisma.js';

export class UserRepository {
  static async findByEmail(email) {
    const normalizedEmail = email.toLowerCase().trim();
    return await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });
  }

  static async findById(id) {
    return await prisma.user.findUnique({
      where: { id }
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
      data: updateData
    });
  }

  static async list({ skip = 0, take = 10, role = null }) {
    const where = role ? { role: role.toUpperCase() } : {};
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
    return await prisma.user.count();
  }
}
