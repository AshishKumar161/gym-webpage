import express from 'express';
import { body } from 'express-validator';
import {
  createInquiry,
  getInquiries,
  updateInquiryStatus
} from '../../../controllers/inquiryController.js';
import { protect, authorize } from '../../../middlewares/authMiddleware.js';
import { validate } from '../../../middlewares/validateMiddleware.js';

const router = express.Router();

router.post(
  '/',
  validate([
    body('name').notEmpty().withMessage('Name is required'),
    body('phone').notEmpty().withMessage('Phone number is required')
  ]),
  createInquiry
);

router.get('/', protect, authorize('admin', 'trainer'), getInquiries);
router.patch('/:id/status', protect, authorize('admin', 'trainer'), updateInquiryStatus);

export default router;
