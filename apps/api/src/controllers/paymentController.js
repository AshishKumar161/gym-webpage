import prisma from '../config/prisma.js';
import PaymentProviderFactory from '../services/payment/PaymentProviderFactory.js';
import { SubscriptionService } from '../services/payment/SubscriptionService.js';
import { generateUniqueId } from '../utils/helpers.js';

const provider = PaymentProviderFactory.getProvider();

export const checkout = async (req, res, next) => {
  try {
    const { membershipId, couponCode } = req.body;
    const user = req.user;

    const membership = await prisma.membership.findUnique({ where: { id: membershipId } });
    if (!membership) {
      return res.status(404).json({ success: false, error: 'Membership not found' });
    }

    let subtotal = parseFloat(membership.price);
    let discount = 0;

    // Handle Coupon
    let appliedCoupon = null;
    if (couponCode) {
      appliedCoupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
      if (appliedCoupon) {
        if (appliedCoupon.maxUses && appliedCoupon.currentUses >= appliedCoupon.maxUses) {
          return res.status(400).json({ success: false, error: 'Coupon usage limit reached' });
        }
        if (appliedCoupon.validUntil && new Date() > appliedCoupon.validUntil) {
          return res.status(400).json({ success: false, error: 'Coupon expired' });
        }
        
        if (appliedCoupon.discountType === 'PERCENTAGE') {
          discount = subtotal * (parseFloat(appliedCoupon.discountValue) / 100);
        } else {
          discount = parseFloat(appliedCoupon.discountValue);
        }
        if (discount > subtotal) discount = subtotal;
      }
    }

    const tax = (subtotal - discount) * 0.18; // 18% GST example
    const totalAmount = subtotal - discount + tax;

    const invoiceNumber = `INV-${Date.now()}-${generateUniqueId(4)}`;

    // Create Order in Gateway
    const order = await provider.createOrder({
      amount: totalAmount,
      currency: 'INR',
      receipt: invoiceNumber,
      notes: { userId: user.id, membershipId: membership.id },
      customerEmail: user.email
    });

    // Save pending payment in DB
    const payment = await prisma.payment.create({
      data: {
        invoiceNumber,
        userId: user.id,
        planName: membership.title,
        amount: totalAmount,
        subtotal,
        discount,
        tax,
        currency: order.currency || 'INR',
        gateway: (process.env.ACTIVE_PAYMENT_GATEWAY || 'RAZORPAY').toUpperCase(),
        gatewayOrderId: order.id,
        couponId: appliedCoupon ? appliedCoupon.id : null,
        status: 'PENDING'
      }
    });

    res.status(200).json({ success: true, data: { order, paymentId: payment.id } });
  } catch (err) {
    next(err);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { paymentId, gatewayPaymentId, signature, payload, membershipId } = req.body;
    
    // In a real flow, payload/signature comes from webhook.
    // For synchronous client-side verification (e.g. Razorpay modal success):
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) return res.status(404).json({ success: false, error: 'Payment not found' });

    if (payment.status === 'PAID') {
      return res.status(200).json({ success: true, message: 'Already paid' });
    }

    // Verify signature if provided, else trust for mock
    let isValid = true;
    if (signature && payload) {
      isValid = provider.verifyWebhookSignature(payload, signature);
    }
    
    if (!isValid) {
      return res.status(400).json({ success: false, error: 'Invalid signature' });
    }

    // Update payment
    await prisma.payment.update({
      where: { id: payment.id },
      data: { 
        status: 'PAID', 
        gatewayPaymentId: gatewayPaymentId || 'mock_txn_' + Date.now(),
        paidAt: new Date()
      }
    });

    // Update coupon usages if any
    if (payment.couponId) {
      await prisma.coupon.update({
        where: { id: payment.couponId },
        data: { currentUses: { increment: 1 } }
      });
    }

    // Generate Invoice
    await prisma.invoice.create({
      data: {
        paymentId: payment.id,
        invoiceNumber: payment.invoiceNumber,
        pdfUrl: `/api/v1/payments/invoice/${payment.invoiceNumber}/pdf` // Mock URL
      }
    });

    // Process Subscription
    if (membershipId) {
      const membership = await prisma.membership.findUnique({ where: { id: membershipId } });
      await SubscriptionService.processRenewal(payment.userId, membershipId, membership.durationMonths, payment.invoiceNumber);
    }

    res.status(200).json({ success: true, message: 'Payment verified successfully' });
  } catch (err) {
    next(err);
  }
};

export const handleWebhook = async (req, res, next) => {
  try {
    const gateway = (process.env.ACTIVE_PAYMENT_GATEWAY || 'RAZORPAY').toUpperCase();
    const payload = JSON.stringify(req.body);
    const signature = req.headers['x-razorpay-signature'] || req.headers['stripe-signature'];
    
    // Idempotency Check
    const eventId = req.body.id || req.headers['stripe-signature']; 
    if (eventId) {
      const existing = await prisma.webhookEvent.findUnique({ where: { eventId } });
      if (existing && existing.processed) {
        return res.status(200).send('Already processed');
      }
      
      await prisma.webhookEvent.upsert({
        where: { eventId },
        update: { payload, gateway },
        create: { eventId, payload, gateway, type: req.body.event || 'unknown' }
      });
    }

    const isValid = provider.verifyWebhookSignature(payload, signature);
    if (!isValid) return res.status(400).send('Invalid signature');

    // Handle specific events (e.g., payment.captured)
    // ... Custom logic depending on gateway

    if (eventId) {
      await prisma.webhookEvent.update({
        where: { eventId },
        data: { processed: true }
      });
    }

    res.status(200).send('Webhook received');
  } catch (err) {
    console.error('Webhook Error:', err);
    res.status(500).send('Webhook Error');
  }
};

export const getInvoices = async (req, res, next) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { userId: req.user.id, status: 'PAID' },
      include: { invoice: true },
      orderBy: { paidAt: 'desc' }
    });
    res.status(200).json({ success: true, data: payments });
  } catch (err) {
    next(err);
  }
};
