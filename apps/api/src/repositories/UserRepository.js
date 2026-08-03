import prisma from '../config/prisma.js';
import User from '../models/User.js';

export class UserRepository {
  static async findByEmail(email) {
    const normalizedEmail = email.toLowerCase().trim();
    try {
      return await prisma.user.findUnique({
        where: { email: normalizedEmail }
      });
    } catch {
      return await User.findOne({ email: normalizedEmail }).select('+password +failedLoginAttempts +accountLockedUntil +auditLogs');
    }
  }

  static async findById(id) {
    try {
      return await prisma.user.findUnique({
        where: { id }
      });
    } catch {
      return await User.findById(id);
    }
  }

  static async create(userData) {
    try {
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
    } catch {
      const mongoUser = await User.create(userData);
      return {
        id: mongoUser._id.toString(),
        name: mongoUser.name,
        email: mongoUser.email,
        phone: mongoUser.phone,
        avatar: mongoUser.avatar,
        role: mongoUser.role.toUpperCase(),
        emailVerified: mongoUser.emailVerified,
        createdAt: mongoUser.createdAt,
        updatedAt: mongoUser.updatedAt
      };
    }
  }

  static async update(id, updateData) {
    try {
      return await prisma.user.update({
        where: { id },
        data: updateData
      });
    } catch {
      return await User.findByIdAndUpdate(id, updateData, { new: true });
    }
  }

  static async list({ skip = 0, take = 10, role = null }) {
    const where = role ? { role } : {};
    try {
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
    } catch {
      const query = role ? { role: role.toLowerCase() } : {};
      const users = await User.find(query).skip(skip).limit(take).sort({ createdAt: -1 });
      const total = await User.countDocuments(query);
      return { users, total };
    }
  }

  static async count() {
    try {
      return await prisma.user.count();
    } catch {
      return await User.countDocuments();
    }
  }
}
