import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, BookingStatus, ClassStatus } from '@prisma/client';

@Injectable()
export class ClassesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, query: Record<string, string>) {
    const requester = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!requester) throw new NotFoundException('User not found');

    const classes = await this.prisma.groupClass.findMany({
      orderBy: { scheduledAt: 'asc' },
      include: {
        bookings: {
          where: { status: BookingStatus.CONFIRMED },
          select: { userId: true },
        },
      },
    });

    // Mark each class with user's booking status
    return classes.map((c) => {
      const isBooked = c.bookings.some((b) => b.userId === userId);
      return {
        ...c,
        isBooked,
        availableSlots: Math.max(0, c.capacity - c.bookings.length),
      };
    });
  }

  async findOne(id: string, userId: string) {
    const groupClass = await this.prisma.groupClass.findUnique({
      where: { id },
      include: {
        bookings: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
      },
    });

    if (!groupClass) throw new NotFoundException('Class not found');

    const isBooked = groupClass.bookings.some((b) => b.userId === userId);

    return {
      ...groupClass,
      isBooked,
      availableSlots: Math.max(0, groupClass.capacity - groupClass.bookings.length),
    };
  }

  async create(userId: string, dto: any) {
    const requester = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!requester) throw new NotFoundException('User not found');

    // 1. Member Booking Action
    if (dto.classId) {
      const classId = dto.classId;

      const groupClass = await this.prisma.groupClass.findUnique({
        where: { id: classId },
        include: {
          bookings: {
            where: { status: BookingStatus.CONFIRMED },
          },
        },
      });

      if (!groupClass) throw new NotFoundException('Class not found');
      if (groupClass.status !== ClassStatus.SCHEDULED) {
        throw new BadRequestException('Class is not open for bookings');
      }

      // Check if already booked
      const existingBooking = await this.prisma.classBooking.findUnique({
        where: {
          userId_classId: { userId, classId },
        },
      });

      if (existingBooking) {
        // Toggle: If booked, cancel/delete it
        await this.prisma.classBooking.delete({
          where: { id: existingBooking.id },
        });
        return { booked: false, message: 'Class booking cancelled' };
      }

      // Check capacity
      if (groupClass.bookings.length >= groupClass.capacity) {
        throw new BadRequestException('Class is already full');
      }

      // Create Booking
      const booking = await this.prisma.classBooking.create({
        data: {
          userId,
          classId,
          status: BookingStatus.CONFIRMED,
        },
      });

      return { booked: true, booking };
    }

    // 2. Admin Creation Action
    if (requester.role !== Role.ADMIN && requester.role !== Role.OWNER) {
      throw new ForbiddenException('Only administrators can create classes');
    }

    const { name, description, scheduledAt, durationMins, capacity, category, difficulty, location } = dto;

    return this.prisma.groupClass.create({
      data: {
        name,
        description,
        scheduledAt: new Date(scheduledAt),
        durationMins: durationMins ?? 60,
        capacity: capacity ?? 20,
        category,
        difficulty,
        location: location ?? 'Main Studio',
      },
    });
  }

  async update(id: string, userId: string, dto: any) {
    const requester = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!requester || (requester.role !== Role.ADMIN && requester.role !== Role.OWNER)) {
      throw new ForbiddenException('Only administrators can edit classes');
    }

    const groupClass = await this.prisma.groupClass.findUnique({
      where: { id },
    });

    if (!groupClass) throw new NotFoundException('Class not found');

    const data: any = { ...dto };
    if (dto.scheduledAt) data.scheduledAt = new Date(dto.scheduledAt);

    return this.prisma.groupClass.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, userId: string) {
    const requester = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!requester || (requester.role !== Role.ADMIN && requester.role !== Role.OWNER)) {
      throw new ForbiddenException('Only administrators can cancel/delete classes');
    }

    const groupClass = await this.prisma.groupClass.findUnique({
      where: { id },
    });

    if (!groupClass) throw new NotFoundException('Class not found');

    // Cancelbookings & delete
    await this.prisma.classBooking.deleteMany({ where: { classId: id } });

    return this.prisma.groupClass.delete({
      where: { id },
    });
  }
}

