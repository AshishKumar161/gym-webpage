import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class DietService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, query: Record<string, string>) {
    return this.prisma.dietPlan.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { meals: true },
    });
  }

  async findOne(id: string, userId: string) {
    const plan = await this.prisma.dietPlan.findUnique({
      where: { id },
      include: { meals: true },
    });

    if (!plan) throw new NotFoundException('Diet plan not found');

    const requester = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (
      plan.userId !== userId &&
      requester?.role !== Role.ADMIN &&
      requester?.role !== Role.OWNER
    ) {
      throw new ForbiddenException('Access denied');
    }

    return plan;
  }

  async create(userId: string, dto: any) {
    const { name, description, calories, protein, carbs, fat, meals = [] } = dto;

    return this.prisma.dietPlan.create({
      data: {
        userId,
        name,
        description,
        calories,
        protein,
        carbs,
        fat,
        isActive: dto.isActive ?? true,
        meals: {
          create: meals.map((meal: any) => ({
            name: meal.name,
            mealType: meal.mealType,
            calories: meal.calories,
            protein: meal.protein,
            carbs: meal.carbs,
            fat: meal.fat,
            foods: meal.foods ?? [],
            recipeUrl: meal.recipeUrl,
          })),
        },
      },
      include: { meals: true },
    });
  }

  async update(id: string, userId: string, dto: any) {
    const plan = await this.prisma.dietPlan.findUnique({
      where: { id },
    });

    if (!plan) throw new NotFoundException('Diet plan not found');

    const requester = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (
      plan.userId !== userId &&
      requester?.role !== Role.ADMIN &&
      requester?.role !== Role.OWNER
    ) {
      throw new ForbiddenException('Access denied');
    }

    const { name, description, calories, protein, carbs, fat, meals } = dto;

    // Delete existing meals if update request includes them
    if (meals) {
      await this.prisma.dietMeal.deleteMany({
        where: { planId: id },
      });
    }

    return this.prisma.dietPlan.update({
      where: { id },
      data: {
        name,
        description,
        calories,
        protein,
        carbs,
        fat,
        isActive: dto.isActive,
        ...(meals && {
          meals: {
            create: meals.map((meal: any) => ({
              name: meal.name,
              mealType: meal.mealType,
              calories: meal.calories,
              protein: meal.protein,
              carbs: meal.carbs,
              fat: meal.fat,
              foods: meal.foods ?? [],
              recipeUrl: meal.recipeUrl,
            })),
          },
        }),
      },
      include: { meals: true },
    });
  }

  async remove(id: string, userId: string) {
    const plan = await this.prisma.dietPlan.findUnique({
      where: { id },
    });

    if (!plan) throw new NotFoundException('Diet plan not found');

    const requester = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (
      plan.userId !== userId &&
      requester?.role !== Role.ADMIN &&
      requester?.role !== Role.OWNER
    ) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.dietPlan.delete({
      where: { id },
    });
  }
}

