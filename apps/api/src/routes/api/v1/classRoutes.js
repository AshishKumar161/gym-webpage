import express from 'express';
import { getClasses, createClass, bookClass, deleteClass } from '../../../controllers/classController.js';
import { protect, authorize } from '../../../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/classes:
 *   get:
 *     summary: List gym fitness classes
 *     tags:
 *       - Classes & Schedule
 *     responses:
 *       200:
 *         description: List of fitness classes
 *   post:
 *     summary: Schedule new fitness class (Admin/Trainer)
 *     tags:
 *       - Classes & Schedule
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GymClass'
 *     responses:
 *       201:
 *         description: Class created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/', getClasses);
router.post('/', protect, authorize('admin', 'trainer'), createClass);

/**
 * @swagger
 * /api/v1/classes/{id}/book:
 *   post:
 *     summary: Book a spot in a fitness class
 *     tags:
 *       - Classes & Schedule
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
 *         description: Class booked successfully
 *       400:
 *         description: Class full or already booked
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Class not found
 */
router.post('/:id/book', protect, bookClass);

/**
 * @swagger
 * /api/v1/classes/{id}:
 *   delete:
 *     summary: Cancel/Delete a class (Admin/Trainer)
 *     tags:
 *       - Classes & Schedule
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
 *         description: Class canceled successfully
 *       404:
 *         description: Class not found
 */
router.delete('/:id', protect, authorize('admin', 'trainer'), deleteClass);

export default router;
