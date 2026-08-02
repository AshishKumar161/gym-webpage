import express from 'express';
import { getCoupons, createCoupon, deleteCoupon } from '../../../controllers/couponController.js';
import { protect, authorize } from '../../../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/', getCoupons);
router.post('/', createCoupon);
router.delete('/:id', deleteCoupon);

export default router;
