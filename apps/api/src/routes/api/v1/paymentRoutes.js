import express from 'express';
import { protect, authorize } from '../../../middlewares/authMiddleware.js';
import { 
  checkout, 
  verifyPayment, 
  handleWebhook, 
  getInvoices 
} from '../../../controllers/paymentController.js';

const router = express.Router();

// Webhook endpoint (should typically use raw body parser for Stripe, but we assume express.json is fine for Razorpay/Mock)
router.post('/webhook', handleWebhook);

// Protected Member routes
router.use(protect);

router.post('/checkout', checkout);
router.post('/verify', verifyPayment);
router.get('/invoices', getInvoices);

export default router;
