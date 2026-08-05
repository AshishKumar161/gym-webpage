import Razorpay from 'razorpay';
import crypto from 'crypto';
import { BasePaymentProvider } from './BasePaymentProvider.js';

class RazorpayProvider extends BasePaymentProvider {
  constructor() {
    super();
    // In test environment, we might not have keys, handle gracefully
    this.keyId = process.env.RAZORPAY_KEY_ID || 'dummy_key_id';
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret';
    
    try {
      this.razorpay = new Razorpay({
        key_id: this.keyId,
        key_secret: this.keySecret
      });
    } catch(err) {
      console.warn("Failed to initialize Razorpay, proceeding in mock mode for tests.");
      this.razorpay = null;
    }
  }

  async createOrder({ amount, currency = 'INR', receipt, notes }) {
    if (this.keyId === 'dummy_key_id') {
      console.log('Running in MOCK Razorpay mode');
      return {
        id: 'order_mock_' + Date.now(),
        amount: Math.round(amount * 100),
        currency,
        receipt,
        status: 'created',
        notes
      };
    }

    try {
      const options = {
        amount: Math.round(amount * 100), // amount in smallest currency unit (paise)
        currency,
        receipt,
        notes
      };
      const order = await this.razorpay.orders.create(options);
      return order;
    } catch (error) {
      console.error("Razorpay Order Creation Failed:", error);
      throw new Error("Failed to create Razorpay order.");
    }
  }

  verifyWebhookSignature(payload, signature) {
    if (this.keySecret === 'dummy_key_secret') {
      return true; // Auto-verify in mock mode
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || this.keySecret)
      .update(payload)
      .digest('hex');

    return expectedSignature === signature;
  }

  async issueRefund(paymentId, amount) {
    if (this.keyId === 'dummy_key_id') {
      return { id: 'rfnd_mock_' + Date.now(), status: 'processed' };
    }

    try {
      const refund = await this.razorpay.payments.refund(paymentId, {
        amount: Math.round(amount * 100)
      });
      return refund;
    } catch (error) {
      console.error("Razorpay Refund Failed:", error);
      throw new Error("Failed to issue Razorpay refund.");
    }
  }
}

export default RazorpayProvider;
