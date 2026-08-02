import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, query: Record<string, string>) {
    const requester = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!requester) throw new NotFoundException('User not found');

    const page = query.page ? parseInt(query.page) : 1;
    const limit = query.limit ? parseInt(query.limit) : 10;
    const skip = (page - 1) * limit;

    if (requester.role === Role.ADMIN || requester.role === Role.OWNER) {
      const [items, total] = await Promise.all([
        this.prisma.attendance.findMany({
          skip,
          take: limit,
          orderBy: { checkInTime: 'desc' },
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        }),
        this.prisma.attendance.count(),
      ]);

      return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    // Members see their own attendance logs
    const items = await this.prisma.attendance.findMany({
      where: { userId },
      orderBy: { checkInTime: 'desc' },
    });

    return { items, total: items.length };
  }

  async findOne(id: string, userId: string) {
    const requester = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!requester) throw new NotFoundException('User not found');

    const record = await this.prisma.attendance.findUnique({
      where: { id },
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
    });

    if (!record) throw new NotFoundException('Attendance record not found');

    if (
      record.userId !== userId &&
      requester.role !== Role.ADMIN &&
      requester.role !== Role.OWNER
    ) {
      throw new ForbiddenException('Access denied');
    }

    return record;
  }

  async create(userId: string, dto: any) {
    // Determine target user (admin scanning a member vs self-checkin)
    const targetUserId = dto.memberId ?? userId;

    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        memberships: {
          where: { status: 'ACTIVE' },
          take: 1,
        },
      },
    });

    if (!targetUser) throw new NotFoundException('User not found');

    // Members need active membership to check-in
    if (targetUser.role === Role.MEMBER && targetUser.memberships.length === 0) {
      throw new BadRequestException('User does not have an active membership');
    }

    // Look for active check-in (where checkout time is null)
    const activeCheckIn = await this.prisma.attendance.findFirst({
      where: {
        userId: targetUserId,
        checkOutTime: null,
      },
      orderBy: { checkInTime: 'desc' },
    });

    const now = new Date();

    if (activeCheckIn) {
      // Checkout
      const durationMins = Math.max(
        1,
        Math.floor((now.getTime() - activeCheckIn.checkInTime.getTime()) / (1000 * 60))
      );

      return this.prisma.attendance.update({
        where: { id: activeCheckIn.id },
        data: {
          checkOutTime: now,
          durationMins,
          notes: dto.notes ?? 'Contactless checkout',
        },
      });
    } else {
      // Check-in
      return this.prisma.attendance.create({
        data: {
          userId: targetUserId,
          checkInTime: now,
          method: dto.method ?? 'QR',
          notes: dto.notes ?? 'Contactless check-in',
        },
      });
    }
  }

  async update(id: string, userId: string, dto: any) {
    const requester = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!requester) throw new NotFoundException('User not found');

    if (requester.role !== Role.ADMIN && requester.role !== Role.OWNER) {
      throw new ForbiddenException('Only administrators can update attendance logs');
    }

    const record = await this.prisma.attendance.findUnique({
      where: { id },
    });

    if (!record) throw new NotFoundException('Attendance record not found');

    const data: any = {};
    if (dto.checkInTime) data.checkInTime = new Date(dto.checkInTime);
    if (dto.checkOutTime) {
      data.checkOutTime = new Date(dto.checkOutTime);
      if (record.checkInTime) {
        const inTime = data.checkInTime ?? record.checkInTime;
        data.durationMins = Math.max(1, Math.floor((data.checkOutTime.getTime() - inTime.getTime()) / (1000 * 60)));
      }
    }
    if (dto.notes !== undefined) data.notes = dto.notes;

    return this.prisma.attendance.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, userId: string) {
    const requester = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!requester) throw new NotFoundException('User not found');

    if (requester.role !== Role.ADMIN && requester.role !== Role.OWNER) {
      throw new ForbiddenException('Only administrators can delete attendance records');
    }

    return this.prisma.attendance.delete({
      where: { id },
    });
  }
}

