import { planRepository } from '../repositories/plan.repository.js';
import { AppError } from '../utils/AppError.js';
// @ts-ignore
import logger from '../utils/logger.js';

export class PlanService {
  async getAll(gymId: string, includeInactive = false) {
    return planRepository.findAll(gymId, includeInactive);
  }

  async getById(planId: string, gymId: string) {
    const plan = await planRepository.findById(planId, gymId);
    if (!plan) throw new AppError('Plan not found', 404);
    return plan;
  }

  async create(gymId: string, data: Record<string, unknown>) {
    const plan = await planRepository.create({
      gym: { connect: { id: gymId } },
      ...data,
    } as any);
    logger.info('Membership plan created', { gymId, planId: plan.id });
    return plan;
  }

  async update(planId: string, gymId: string, data: Record<string, unknown>) {
    const plan = await planRepository.update(planId, gymId, data);
    if (!plan) throw new AppError('Plan not found', 404);
    logger.info('Membership plan updated', { gymId, planId });
    return plan;
  }

  async delete(planId: string, gymId: string) {
    const plan = await planRepository.softDelete(planId, gymId);
    if (!plan) throw new AppError('Plan not found', 404);
    logger.info('Membership plan deleted', { gymId, planId });
    return plan;
  }
}

export const planService = new PlanService();
