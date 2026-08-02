import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../services/cloudinary.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, firstName: true, lastName: true, phone: true,
        role: true, avatarUrl: true, isEmailVerified: true, dateOfBirth: true,
        gender: true, address: true, city: true, state: true, country: true,
        emergencyContactName: true, emergencyContactPhone: true,
        heightCm: true, weightKg: true, fitnessGoal: true, fitnessLevel: true,
        createdAt: true,
        memberships: {
          where: { status: 'ACTIVE' },
          include: { plan: true },
          orderBy: { endDate: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true, email: true, firstName: true, lastName: true, phone: true,
        avatarUrl: true, dateOfBirth: true, gender: true, address: true,
        city: true, state: true, country: true, heightCm: true, weightKg: true,
        fitnessGoal: true, fitnessLevel: true,
      },
    });
  }

  async uploadAvatar(userId: string, buffer: Buffer) {
    const result = await this.cloudinary.uploadAvatar(buffer, userId);

    await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: result.secureUrl },
    });

    return { avatarUrl: result.secureUrl };
  }

  async getUserStats(userId: string) {
    const [attendanceCount, totalWorkouts, activeMembership, totalPoints] = await Promise.all([
      this.prisma.attendance.count({ where: { userId } }),
      this.prisma.workoutSession.count({ where: { userId, status: 'COMPLETED' } }),
      this.prisma.membership.findFirst({
        where: { userId, status: 'ACTIVE' },
        include: { plan: true },
        orderBy: { endDate: 'desc' },
      }),
      this.prisma.rewardPoint.aggregate({
        where: { userId, type: 'EARNED' },
        _sum: { points: true },
      }),
    ]);

    const redeemedPoints = await this.prisma.rewardPoint.aggregate({
      where: { userId, type: 'REDEEMED' },
      _sum: { points: true },
    });

    const thisMonthAttendance = await this.prisma.attendance.count({
      where: {
        userId,
        checkInTime: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });

    return {
      totalAttendance: attendanceCount,
      thisMonthAttendance,
      totalWorkouts,
      activeMembership,
      rewardPoints: (totalPoints._sum.points ?? 0) - (redeemedPoints._sum.points ?? 0),
      memberSince: await this.prisma.user.findUnique({
        where: { id: userId },
        select: { createdAt: true },
      }).then((u: any) => u?.createdAt),
    };
  }

  async findAll(params: {
    page: number;
    limit: number;
    search?: string;
    role?: Role;
    status?: string;
  }) {
    const { page, limit, search, role, status } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }
    if (role) where.role = role;
    if (status === 'active') where.isActive = true;
    if (status === 'inactive') where.isActive = false;

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, email: true, firstName: true, lastName: true, phone: true,
          role: true, avatarUrl: true, isActive: true, isEmailVerified: true,
          createdAt: true, lastLoginAt: true,
          memberships: {
            where: { status: 'ACTIVE' },
            include: { plan: { select: { name: true, color: true } } },
            take: 1,
            orderBy: { endDate: 'desc' },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        memberships: { include: { plan: true }, orderBy: { createdAt: 'desc' } },
        attendance: { orderBy: { checkInTime: 'desc' }, take: 10 },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async toggleActivation(id: string, isActive: boolean) {
    return this.prisma.user.update({
      where: { id },
      data: { isActive },
      select: { id: true, isActive: true },
    });
  }

  async changeRole(id: string, role: Role) {
    return this.prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, role: true },
    });
  }
}
