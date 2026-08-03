import prisma from '../config/prisma.js';

export class WorkoutRepository {
  static async findByMemberId(memberId) {
    return await prisma.workoutPlan.findMany({
      where: { memberId },
      include: { exercises: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async findByTrainerId(trainerId) {
    return await prisma.workoutPlan.findMany({
      where: { trainerId },
      include: { exercises: true, member: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async create(workoutData, exercises = []) {
    return await prisma.workoutPlan.create({
      data: {
        ...workoutData,
        exercises: {
          create: exercises
        }
      },
      include: { exercises: true }
    });
  }
}
