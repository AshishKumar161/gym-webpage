import express from 'express';
import { getAdminAnalytics, getUsers, updateUser, deleteUser } from '../../../controllers/adminController.js';
import { protect, authorize } from '../../../middlewares/authMiddleware.js';

const router = express.Router();

// Only ADMIN can access /admin/*
router.use(protect, authorize('ADMIN', 'admin'));

/**
 * @swagger
 * /api/v1/admin/analytics:
 *   get:
 *     summary: Get System Analytics & Governance KPIs
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Administrative metrics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/analytics', getAdminAnalytics);

/**
 * @swagger
 * /api/v1/admin/users:
 *   get:
 *     summary: List all users in system (Admin view)
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User list retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/users', getUsers);

/**
 * @swagger
 * /api/v1/admin/users/{id}:
 *   put:
 *     summary: Update user details or role
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: 'string' }
 *               email: { type: 'string' }
 *               role: { type: 'string', enum: ['MEMBER', 'TRAINER', 'ADMIN'] }
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 *       403:
 *         description: Forbidden
 *   delete:
 *     summary: Delete user account
 *     tags:
 *       - Admin
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
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       403:
 *         description: Forbidden
 */
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

export default router;
