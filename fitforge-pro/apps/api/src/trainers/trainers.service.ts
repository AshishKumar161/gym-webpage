import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, BookingStatus } from '@prisma/client';

@Injectable()
export class TrainersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, query: Record<string, string>) {
    // If client asks for bookings list
    if (query.type === 'bookings') {
      const requester = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      if (!requester) throw new NotFoundException('User not found');

      if (requester.role === Role.TRAINER) {
        return this.prisma.trainerBooking.findMany({
          where: { trainerId: userId },
          orderBy: { scheduledAt: 'desc' },
          include: {
            member: { select: { firstName: true, lastName: true, email: true, phone: true } },
          },
        });
      }

      return this.prisma.trainerBooking.findMany({
        where: { memberId: userId },
        orderBy: { scheduledAt: 'desc' },
        include: {
          trainer: { select: { firstName: true, lastName: true, email: true } },
        },
      });
    }

    // Otherwise, return all trainers list
    return this.prisma.user.findMany({
      where: { role: Role.TRAINER },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatarUrl: true,
        trainerProfile: true,
      },
    });
  }

  async findOne(id: string, userId: string) {
    const trainer = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatarUrl: true,
        trainerProfile: true,
      },
    });

    if (!trainer || trainer.trainerProfile === null) {
      // Create profile if user is a trainer but profile doesn't exist yet
      const userObj = await this.prisma.user.findUnique({ where: { id } });
      if (userObj && userObj.role === Role.TRAINER) {
        const newProfile = await this.prisma.trainerProfile.create({
          data: {
            userId: id,
            bio: 'Certified fitness coach ready to guide you.',
            specializations: ['General Fitness'],
            certifications: ['FIT Certified'],
            experience: 2,
          },
        });
        return { ...userObj, trainerProfile: newProfile };
      }
      throw new NotFoundException('Trainer not found');
    }

    return trainer;
  }

  async create(userId: string, dto: any) {
    // 1. Create a 1-on-1 Session Booking
    if (dto.trainerId && dto.scheduledAt) {
      const scheduledAt = new Date(dto.scheduledAt);
      if (scheduledAt.getTime() < Date.now()) {
        throw new BadRequestException('Cannot book sessions in the past');
      }

      return this.prisma.trainerBooking.create({
        data: {
          memberId: userId,
          trainerId: dto.trainerId,
          scheduledAt,
          durationMins: dto.durationMins ?? 60,
          notes: dto.notes ?? '1-on-1 Personal Training Session',
          status: BookingStatus.CONFIRMED,
        },
      });
    }

    // 2. Admin creating a trainer profile
    const requester = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (requester?.role !== Role.ADMIN && requester?.role !== Role.OWNER) {
      throw new ForbiddenException('Only administrators can configure profiles');
    }

    const targetUserId = dto.userId ?? userId;

    return this.prisma.trainerProfile.upsert({
      where: { userId: targetUserId },
      update: {
        bio: dto.bio,
        specializations: dto.specializations,
        certifications: dto.certifications,
        experience: dto.experience,
        hourlyRate: dto.hourlyRate,
        instagram: dto.instagram,
        youtube: dto.youtube,
      },
      create: {
        userId: targetUserId,
        bio: dto.bio ?? '',
        specializations: dto.specializations ?? [],
        certifications: dto.certifications ?? [],
        experience: dto.experience ?? 0,
        hourlyRate: dto.hourlyRate,
        instagram: dto.instagram,
        youtube: dto.youtube,
      },
    });
  }

  async update(id: string, userId: string, dto: any) {
    const requester = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!requester) throw new NotFoundException('User not found');

    // 1. Update Booking Status (e.g. Completed or Cancelled)
    if (dto.status || dto.sessionNotes !== undefined) {
      const booking = await this.prisma.trainerBooking.findUnique({
        where: { id },
      });

      if (!booking) throw new NotFoundException('Booking not found');

      if (
        booking.trainerId !== userId &&
        booking.memberId !== userId &&
        requester.role !== Role.ADMIN &&
        requester.role !== Role.OWNER
      ) {
        throw new ForbiddenException('Access denied');
      }

      const updateData: any = {};
      if (dto.status) updateData.status = dto.status;
      if (dto.sessionNotes !== undefined) updateData.sessionNotes = dto.sessionNotes;
      if (dto.cancelReason !== undefined) updateData.cancelReason = dto.cancelReason;

      return this.prisma.trainerBooking.update({
        where: { id },
        data: updateData,
      });
    }

    // 2. Update Trainer Profile
    if (
      userId !== id &&
      requester.role !== Role.ADMIN &&
      requester.role !== Role.OWNER
    ) {
      throw new ForbiddenException('Only owner can modify profile');
    }

    return this.prisma.trainerProfile.update({
      where: { userId: id },
      data: dto,
    });
  }

  async remove(id: string, userId: string) {
    const requester = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!requester) throw new NotFoundException('User not found');

    const booking = await this.prisma.trainerBooking.findUnique({
      where: { id },
    });

    if (!booking) {
      // Attempt profile delete
      if (requester.role === Role.ADMIN || requester.role === Role.OWNER) {
        return this.prisma.trainerProfile.delete({ where: { userId: id } });
      }
      throw new NotFoundException('Booking or Profile not found');
    }

    if (
      booking.trainerId !== userId &&
      booking.memberId !== userId &&
      requester.role !== Role.ADMIN &&
      requester.role !== Role.OWNER
    ) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.trainerBooking.delete({
      where: { id },
    });
  }
}

