import { Router } from 'express';
import { memberController } from '../controllers/member.controller.js';
// @ts-ignore
import { protect as authenticate, authorize } from '../middlewares/authMiddleware.js';

import { validateRequest } from '../middlewares/validateRequest.js';
import {
  createMemberValidator, updateMemberValidator, memberIdParamValidator,
  memberQueryValidator, assignPlanValidator, freezeMembershipValidator,
  renewMembershipValidator, addNoteValidator, assignTrainerValidator,
} from '../validators/member.validator.js';

const router = Router();
router.use(authenticate);

// We use authorize instead of hasPermission since hasPermission is likely not fully implemented or requires exact matching
// Assuming MANAGER and SUPER_ADMIN have access, and maybe RECEPTIONIST.

// Members
router.get('/', authorize('MANAGER', 'SUPER_ADMIN', 'RECEPTIONIST'), validateRequest(memberQueryValidator), memberController.getAll.bind(memberController));
router.get('/stats', authorize('MANAGER', 'SUPER_ADMIN', 'RECEPTIONIST'), memberController.getStats.bind(memberController));
router.get('/:memberId', authorize('MANAGER', 'SUPER_ADMIN', 'RECEPTIONIST', 'TRAINER'), validateRequest(memberIdParamValidator), memberController.getById.bind(memberController));
router.post('/', authorize('MANAGER', 'SUPER_ADMIN', 'RECEPTIONIST'), validateRequest(createMemberValidator), memberController.create.bind(memberController));
router.patch('/:memberId', authorize('MANAGER', 'SUPER_ADMIN', 'RECEPTIONIST'), validateRequest(memberIdParamValidator), validateRequest(updateMemberValidator), memberController.update.bind(memberController));
router.delete('/:memberId', authorize('MANAGER', 'SUPER_ADMIN'), validateRequest(memberIdParamValidator), memberController.delete.bind(memberController));

// Membership operations
router.post('/:memberId/assign-plan', authorize('MANAGER', 'SUPER_ADMIN', 'RECEPTIONIST'), validateRequest(memberIdParamValidator), validateRequest(assignPlanValidator), memberController.assignPlan.bind(memberController));
router.post('/:memberId/freeze', authorize('MANAGER', 'SUPER_ADMIN', 'RECEPTIONIST'), validateRequest(memberIdParamValidator), validateRequest(freezeMembershipValidator), memberController.freezeMembership.bind(memberController));
router.post('/:memberId/unfreeze', authorize('MANAGER', 'SUPER_ADMIN', 'RECEPTIONIST'), validateRequest(memberIdParamValidator), memberController.unfreezeMembership.bind(memberController));
router.post('/:memberId/renew', authorize('MANAGER', 'SUPER_ADMIN', 'RECEPTIONIST'), validateRequest(memberIdParamValidator), validateRequest(renewMembershipValidator), memberController.renewMembership.bind(memberController));
router.post('/:memberId/cancel', authorize('MANAGER', 'SUPER_ADMIN'), validateRequest(memberIdParamValidator), memberController.cancelMembership.bind(memberController));

// Notes
router.post('/:memberId/notes', authorize('MANAGER', 'SUPER_ADMIN', 'RECEPTIONIST', 'TRAINER'), validateRequest(memberIdParamValidator), validateRequest(addNoteValidator), memberController.addNote.bind(memberController));

// Trainer assignment
router.post('/:memberId/assign-trainer', authorize('MANAGER', 'SUPER_ADMIN'), validateRequest(memberIdParamValidator), validateRequest(assignTrainerValidator), memberController.assignTrainer.bind(memberController));
router.delete('/:memberId/remove-trainer', authorize('MANAGER', 'SUPER_ADMIN'), validateRequest(memberIdParamValidator), memberController.removeTrainer.bind(memberController));

export default router;
