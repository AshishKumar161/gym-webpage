import express from 'express';
import { validateBody } from '../../../middlewares/zodValidator.js';
import { inquirySchema, updateInquiryStatusSchema } from '../../../validators/commonValidator.js';
import {
  createInquiry,
  getInquiries,
  updateInquiryStatus
} from '../../../controllers/inquiryController.js';
import { protect, authorize } from '../../../middlewares/authMiddleware.js';


const router = express.Router();

/**
 * @swagger
 * /api/v1/inquiries:
 *   post:
 *     summary: Submit public membership/training inquiry
 *     tags:
 *       - Inquiries & Support
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Inquiry'
 *     responses:
 *       201:
 *         description: Inquiry submitted successfully
 *       400:
 *         description: Validation error
 *   get:
 *     summary: List lead inquiries (Admin/Trainer)
 *     tags:
 *       - Inquiries & Support
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of inquiries
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  '/',
  validateBody(inquirySchema),
  createInquiry
);

router.get('/', protect, authorize('admin', 'trainer'), getInquiries);

/**
 * @swagger
 * /api/v1/inquiries/{id}/status:
 *   patch:
 *     summary: Update inquiry status (Admin/Trainer)
 *     tags:
 *       - Inquiries & Support
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
 *             type: object
 *             properties:
 *               status: { type: 'string', example: 'RESOLVED' }
 *     responses:
 *       200:
 *         description: Inquiry status updated
 *       404:
 *         description: Inquiry not found
 */
router.patch('/:id/status', protect, authorize('admin', 'trainer'), validateBody(updateInquiryStatusSchema), updateInquiryStatus);

export default router;
