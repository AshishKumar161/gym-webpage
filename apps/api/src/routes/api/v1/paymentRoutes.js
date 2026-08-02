import express from 'express';
import { getPayments, createPayment, updatePaymentStatus } from '../../../controllers/paymentController.js';
import { protect, authorize } from '../../../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getPayments);
router.post('/', authorize('admin'), createPayment);
router.patch('/:id/status', authorize('admin'), updatePaymentStatus);

export default router;
