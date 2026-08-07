import { Request, Response, NextFunction } from 'express';
import { memberService } from '../services/member.service.js';
import { sendSuccess, sendCreated } from '../utils/apiResponse.js';

export class MemberController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await memberService.getAll((req as any).user.gymId, req.query);
      sendSuccess(res, result.data, 'Members fetched', 200, result.meta);
    } catch (error) { next(error); }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const member = await memberService.getById(req.params.memberId as string, (req as any).user.gymId);
      sendSuccess(res, member, 'Member fetched');
    } catch (error) { next(error); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const member = await memberService.create(
        (req as any).user.gymId,
        (req as any).user.branchId || '',
        (req as any).user.id,
        req.body
      );
      sendCreated(res, member, 'Member created');
    } catch (error) { next(error); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const member = await memberService.update(req.params.memberId as string, (req as any).user.gymId, req.body);
      sendSuccess(res, member, 'Member updated');
    } catch (error) { next(error); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await memberService.delete(req.params.memberId as string, (req as any).user.gymId);
      sendSuccess(res, null, 'Member deleted');
    } catch (error) { next(error); }
  }

  async assignPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await memberService.assignPlan(req.params.memberId as string, (req as any).user.gymId, req.body);
      sendSuccess(res, result, 'Plan assigned');
    } catch (error) { next(error); }
  }

  async freezeMembership(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await memberService.freezeMembership(
        req.params.memberId as string, (req as any).user.gymId, req.body.freezeDays, req.body.reason
      );
      sendSuccess(res, result, 'Membership frozen');
    } catch (error) { next(error); }
  }

  async unfreezeMembership(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await memberService.unfreezeMembership(req.params.memberId as string, (req as any).user.gymId);
      sendSuccess(res, result, 'Membership unfrozen');
    } catch (error) { next(error); }
  }

  async renewMembership(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await memberService.renewMembership(req.params.memberId as string, (req as any).user.gymId, req.body);
      sendSuccess(res, result, 'Membership renewed');
    } catch (error) { next(error); }
  }

  async cancelMembership(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await memberService.cancelMembership(
        req.params.memberId as string, (req as any).user.gymId, req.body?.reason
      );
      sendSuccess(res, result, 'Membership cancelled');
    } catch (error) { next(error); }
  }

  async addNote(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await memberService.addNote(
        req.params.memberId as string, (req as any).user.gymId, (req as any).user.id, req.body.content, req.body.isPrivate
      );
      sendSuccess(res, result, 'Note added');
    } catch (error) { next(error); }
  }

  async assignTrainer(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await memberService.assignTrainer(
        req.params.memberId as string, (req as any).user.gymId, req.body.trainerId, (req as any).user.id, req.body.notes
      );
      sendSuccess(res, result, 'Trainer assigned');
    } catch (error) { next(error); }
  }

  async removeTrainer(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await memberService.removeTrainer(req.params.memberId as string, (req as any).user.gymId);
      sendSuccess(res, result, 'Trainer removed');
    } catch (error) { next(error); }
  }

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await memberService.getStats((req as any).user.gymId, req.query.branchId as string);
      sendSuccess(res, stats, 'Member stats fetched');
    } catch (error) { next(error); }
  }
}

export const memberController = new MemberController();
