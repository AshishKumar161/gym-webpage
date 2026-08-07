import { Router } from 'express';
import { planController } from '../controllers/plan.controller.js';
// @ts-ignore
import { protect as authenticate, authorize } from '../middlewares/authMiddleware.js';

import { validateRequest } from '../middlewares/validateRequest.js';
import { createPlanValidator, updatePlanValidator, planIdParamValidator } from '../validators/plan.validator.js';

const router = Router();
router.use(authenticate);

router.get('/', planController.getAll.bind(planController));
router.get('/:planId', validateRequest(planIdParamValidator), planController.getById.bind(planController));
router.post('/', authorize('MANAGER', 'SUPER_ADMIN'), validateRequest(createPlanValidator), planController.create.bind(planController));
router.patch('/:planId', authorize('MANAGER', 'SUPER_ADMIN'), validateRequest(planIdParamValidator), validateRequest(updatePlanValidator), planController.update.bind(planController));
router.delete('/:planId', authorize('MANAGER', 'SUPER_ADMIN'), validateRequest(planIdParamValidator), planController.delete.bind(planController));

export default router;
