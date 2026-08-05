import Stripe from 'stripe';
import { BasePaymentProvider } from './BasePaymentProvider.js';

class StripeProvider extends BasePaymentProvider {
  constructor() {
    super();
    this.secretKey = process.env.STRIPE_SECRET_KEY || 'dummy_stripe_key';
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'dummy_webhook_secret';
    
    try {
      this.stripe = new Stripe(this.secretKey, {
        apiVersion: '2023-10-16' // Standard version
      });
    } catch(err) {
      console.warn("Failed to initialize Stripe, proceeding in mock mode.");
      this.stripe = null;
    }
  }

  async createOrder({ amount, currency = 'inr', receipt, notes, customerEmail }) {
    if (this.secretKey === 'dummy_stripe_key') {
      return {
        id: 'pi_mock_' + Date.now(),
        amount: Math.round(amount * 100),
        currency,
        client_secret: 'mock_secret_' + Date.now(),
        status: 'requires_payment_method'
      };
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency,
        metadata: {
          receipt,
          ...notes
        },
        receipt_email: customerEmail,
      });
      return paymentIntent;
    } catch (error) {
      console.error("Stripe Order Creation Failed:", error);
      throw new Error("Failed to create Stripe payment intent.");
    }
  }

  verifyWebhookSignature(payload, signature) {
    if (this.secretKey === 'dummy_stripe_key') {
      return true;
    }

    try {
      // payload must be the raw Buffer of the request for Stripe
      this.stripe.webhooks.constructEvent(payload, signature, this.webhookSecret);
      return true;
    } catch (err) {
      console.error("Stripe Webhook Signature Verification Failed:", err.message);
      return false;
    }
  }

  async issueRefund(paymentId, amount) {
    if (this.secretKey === 'dummy_stripe_key') {
      return { id: 're_mock_' + Date.now(), status: 'succeeded' };
    }

    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentId,
        amount: Math.round(amount * 100)
      });
      return refund;
    } catch (error) {
      console.error("Stripe Refund Failed:", error);
      throw new Error("Failed to issue Stripe refund.");
    }
  }
}

export default StripeProvider;
