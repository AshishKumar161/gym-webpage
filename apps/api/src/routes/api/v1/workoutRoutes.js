import express from 'express';
import { getWorkoutPlans, createWorkoutPlan, updateWorkoutPlan, deleteWorkoutPlan } from '../../../controllers/workoutController.js';
import { protect, authorize } from '../../../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * /api/v1/workouts:
 *   get:
 *     summary: List workout plans
 *     tags:
 *       - Plans & Workouts
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of workout plans
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Create workout plan (Admin/Trainer)
 *     tags:
 *       - Plans & Workouts
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WorkoutPlan'
 *     responses:
 *       201:
 *         description: Workout plan created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Trainer/Admin required
 */
router.get('/', getWorkoutPlans);
router.post('/', authorize('admin', 'trainer'), createWorkoutPlan);

/**
 * @swagger
 * /api/v1/workouts/{id}:
 *   put:
 *     summary: Update workout plan
 *     tags:
 *       - Plans & Workouts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WorkoutPlan'
 *     responses:
 *       200:
 *         description: Workout plan updated successfully
 *       404:
 *         description: Workout plan not found
 *   delete:
 *     summary: Delete workout plan
 *     tags:
 *       - Plans & Workouts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Workout plan deleted
 *       404:
 *         description: Not found
 */
router.put('/:id', authorize('admin', 'trainer'), updateWorkoutPlan);
router.delete('/:id', authorize('admin', 'trainer'), deleteWorkoutPlan);

export default router;
