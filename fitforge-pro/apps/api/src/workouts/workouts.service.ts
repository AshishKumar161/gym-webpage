import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class WorkoutsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, query: Record<string, string>) {
    return this.prisma.workoutSession.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      include: { exercises: true },
    });
  }

  async findOne(id: string, userId: string) {
    const session = await this.prisma.workoutSession.findUnique({
      where: { id },
      include: { exercises: true },
    });

    if (!session) throw new NotFoundException('Workout session not found');

    const requester = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (
      session.userId !== userId &&
      requester?.role !== Role.ADMIN &&
      requester?.role !== Role.OWNER
    ) {
      throw new ForbiddenException('Access denied');
    }

    return session;
  }

  async create(userId: string, dto: any) {
    const { name, notes, durationMins, caloriesBurned, exercises = [] } = dto;

    const startedAt = dto.startedAt ? new Date(dto.startedAt) : new Date();
    const completedAt = dto.completedAt ? new Date(dto.completedAt) : new Date();

    return this.prisma.workoutSession.create({
      data: {
        userId,
        name,
        notes,
        durationMins,
        caloriesBurned,
        startedAt,
        completedAt,
        status: dto.status ?? 'COMPLETED',
        exercises: {
          create: exercises.map((ex: any) => ({
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            weightKg: ex.weightKg,
            durationSecs: ex.durationSecs,
            distanceKm: ex.distanceKm,
            notes: ex.notes,
          })),
        },
      },
      include: { exercises: true },
    });
  }

  async update(id: string, userId: string, dto: any) {
    const session = await this.prisma.workoutSession.findUnique({
      where: { id },
    });

    if (!session) throw new NotFoundException('Workout session not found');

    const requester = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (
      session.userId !== userId &&
      requester?.role !== Role.ADMIN &&
      requester?.role !== Role.OWNER
    ) {
      throw new ForbiddenException('Access denied');
    }

    const { name, notes, durationMins, caloriesBurned, exercises } = dto;

    // Delete existing exercises if update request includes them
    if (exercises) {
      await this.prisma.workoutExercise.deleteMany({
        where: { sessionId: id },
      });
    }

    return this.prisma.workoutSession.update({
      where: { id },
      data: {
        name,
        notes,
        durationMins,
        caloriesBurned,
        status: dto.status,
        ...(exercises && {
          exercises: {
            create: exercises.map((ex: any) => ({
              name: ex.name,
              sets: ex.sets,
              reps: ex.reps,
              weightKg: ex.weightKg,
              durationSecs: ex.durationSecs,
              distanceKm: ex.distanceKm,
              notes: ex.notes,
            })),
          },
        }),
      },
      include: { exercises: true },
    });
  }

  async remove(id: string, userId: string) {
    const session = await this.prisma.workoutSession.findUnique({
      where: { id },
    });

    if (!session) throw new NotFoundException('Workout session not found');

    const requester = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (
      session.userId !== userId &&
      requester?.role !== Role.ADMIN &&
      requester?.role !== Role.OWNER
    ) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.workoutSession.delete({
      where: { id },
    });
  }
}

