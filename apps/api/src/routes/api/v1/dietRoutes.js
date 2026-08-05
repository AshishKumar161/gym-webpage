import express from 'express';
import { getDietPlans, createDietPlan, updateDietPlan, deleteDietPlan } from '../../../controllers/dietController.js';
import { protect, authorize } from '../../../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * /api/v1/diets:
 *   get:
 *     summary: List diet plans
 *     tags:
 *       - Plans & Diets
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of diet plans
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Create diet plan (Admin/Trainer)
 *     tags:
 *       - Plans & Diets
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DietPlan'
 *     responses:
 *       201:
 *         description: Diet plan created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Trainer/Admin required
 */
router.get('/', getDietPlans);
router.post('/', authorize('admin', 'trainer'), createDietPlan);

/**
 * @swagger
 * /api/v1/diets/{id}:
 *   put:
 *     summary: Update diet plan
 *     tags:
 *       - Plans & Diets
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
 *             $ref: '#/components/schemas/DietPlan'
 *     responses:
 *       200:
 *         description: Diet plan updated
 *       404:
 *         description: Diet plan not found
 *   delete:
 *     summary: Delete diet plan
 *     tags:
 *       - Plans & Diets
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
 *         description: Diet plan deleted
 *       404:
 *         description: Not found
 */
router.put('/:id', authorize('admin', 'trainer'), updateDietPlan);
router.delete('/:id', authorize('admin', 'trainer'), deleteDietPlan);

export default router;
