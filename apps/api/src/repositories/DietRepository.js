import prisma from '../config/prisma.js';

export class DietRepository {
  static async findByMemberId(memberId) {
    return await prisma.dietPlan.findMany({
      where: { memberId },
      include: { meals: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async findByTrainerId(trainerId) {
    return await prisma.dietPlan.findMany({
      where: { trainerId },
      include: { meals: true, member: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async create(dietData, meals = []) {
    return await prisma.dietPlan.create({
      data: {
        ...dietData,
        meals: {
          create: meals
        }
      },
      include: { meals: true }
    });
  }
}
