import express from 'express';
import { validateBody } from '../../../middlewares/zodValidator.js';
import { membershipSchema } from '../../../validators/commonValidator.js';
import {
  getMemberships,
  createMembership,
  subscribePlan
} from '../../../controllers/membershipController.js';
import { protect, authorize } from '../../../middlewares/authMiddleware.js';


const router = express.Router();

/**
 * @swagger
 * /api/v1/memberships:
 *   get:
 *     summary: List all available membership plans
 *     tags:
 *       - Plans & Memberships
 *     responses:
 *       200:
 *         description: List of membership plans
 *   post:
 *     summary: Create a new membership plan (Admin only)
 *     tags:
 *       - Plans & Memberships
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Membership'
 *     responses:
 *       201:
 *         description: Membership created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin required
 */
router.get('/', getMemberships);

router.post(
  '/',
  protect,
  authorize('admin'),
  validateBody(membershipSchema),
  createMembership
);

/**
 * @swagger
 * /api/v1/memberships/{id}/subscribe:
 *   post:
 *     summary: Subscribe to a membership plan
 *     tags:
 *       - Plans & Memberships
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Membership plan UUID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentReference: { type: 'string', example: 'UPI-REF-998877' }
 *     responses:
 *       200:
 *         description: Subscribed successfully
 *       404:
 *         description: Membership plan not found
 *       401:
 *         description: Unauthorized
 */
router.post('/:id/subscribe', protect, subscribePlan);

export default router;
