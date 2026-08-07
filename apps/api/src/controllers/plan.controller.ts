import { Request, Response, NextFunction } from 'express';
import { planService } from '../services/plan.service.js';
import { sendSuccess, sendCreated } from '../utils/apiResponse.js';

export class PlanController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const plans = await planService.getAll((req as any).user.gymId, includeInactive);
      sendSuccess(res, plans, 'Plans fetched');
    } catch (error) { next(error); }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const plan = await planService.getById(req.params.planId as string, (req as any).user.gymId);
      sendSuccess(res, plan, 'Plan fetched');
    } catch (error) { next(error); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const plan = await planService.create((req as any).user.gymId, req.body);
      sendCreated(res, plan, 'Plan created');
    } catch (error) { next(error); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const plan = await planService.update(req.params.planId as string, (req as any).user.gymId, req.body);
      sendSuccess(res, plan, 'Plan updated');
    } catch (error) { next(error); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await planService.delete(req.params.planId as string, (req as any).user.gymId);
      sendSuccess(res, null, 'Plan deleted');
    } catch (error) { next(error); }
  }
}

export const planController = new PlanController();
