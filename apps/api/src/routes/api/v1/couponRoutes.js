import express from 'express';
import { getCoupons, createCoupon, deleteCoupon } from '../../../controllers/couponController.js';
import { protect, authorize } from '../../../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect, authorize('admin'));

/**
 * @swagger
 * /api/v1/coupons:
 *   get:
 *     summary: List discount coupons (Admin only)
 *     tags:
 *       - Admin & Coupons
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of coupons
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin required
 *   post:
 *     summary: Create a new discount coupon (Admin only)
 *     tags:
 *       - Admin & Coupons
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Coupon'
 *     responses:
 *       201:
 *         description: Coupon created successfully
 *       403:
 *         description: Forbidden
 */
router.get('/', getCoupons);
router.post('/', createCoupon);

/**
 * @swagger
 * /api/v1/coupons/{id}:
 *   delete:
 *     summary: Delete a coupon (Admin only)
 *     tags:
 *       - Admin & Coupons
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
 *         description: Coupon deleted
 *       404:
 *         description: Coupon not found
 */
router.delete('/:id', deleteCoupon);

export default router;
