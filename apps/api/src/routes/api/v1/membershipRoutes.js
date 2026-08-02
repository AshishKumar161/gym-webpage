import express from 'express';
import { body } from 'express-validator';
import {
  getMemberships,
  createMembership,
  subscribePlan
} from '../../../controllers/membershipController.js';
import { protect, authorize } from '../../../middlewares/authMiddleware.js';
import { validate } from '../../../middlewares/validateMiddleware.js';

const router = express.Router();

router.get('/', getMemberships);

router.post(
  '/',
  protect,
  authorize('admin'),
  validate([
    body('title').notEmpty().withMessage('Title is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('durationMonths').isInt({ min: 1 }).withMessage('Duration must be at least 1 month')
  ]),
  createMembership
);

router.post('/:id/subscribe', protect, subscribePlan);

export default router;
