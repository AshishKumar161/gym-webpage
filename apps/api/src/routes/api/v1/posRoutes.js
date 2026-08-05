import express from 'express';
import { checkout, getSales } from '../../../controllers/posController.js';
import { protect, authorize } from '../../../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.post('/checkout', checkout); // Trainers/Admins can checkout, maybe Members if it's a member store?
// Let's allow members to checkout via MemberStore, and Admins via POS

router.get('/sales', authorize('ADMIN'), getSales);

export default router;
