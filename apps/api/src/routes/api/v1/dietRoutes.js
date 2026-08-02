import express from 'express';
import { getDietPlans, createDietPlan, updateDietPlan, deleteDietPlan } from '../../../controllers/dietController.js';
import { protect, authorize } from '../../../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getDietPlans);
router.post('/', authorize('admin', 'trainer'), createDietPlan);
router.put('/:id', authorize('admin', 'trainer'), updateDietPlan);
router.delete('/:id', authorize('admin', 'trainer'), deleteDietPlan);

export default router;
