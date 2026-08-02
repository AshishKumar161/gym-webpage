import express from 'express';
import { getWorkoutPlans, createWorkoutPlan, updateWorkoutPlan, deleteWorkoutPlan } from '../../../controllers/workoutController.js';
import { protect, authorize } from '../../../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getWorkoutPlans);
router.post('/', authorize('admin', 'trainer'), createWorkoutPlan);
router.put('/:id', authorize('admin', 'trainer'), updateWorkoutPlan);
router.delete('/:id', authorize('admin', 'trainer'), deleteWorkoutPlan);

export default router;
