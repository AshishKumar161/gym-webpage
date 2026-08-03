import crypto from 'crypto';
import { PaymentRepository } from '../repositories/PaymentRepository.js';

export class PaymentService {
  static async recordPayment({ userId, planName, amount, paymentMethod = 'UPI' }) {
    const invoiceNumber = `INV-${Date.now()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
    return await PaymentRepository.create({
      invoiceNumber,
      userId,
      planName,
      amount,
      paymentMethod,
      status: 'paid'
    });
  }

  static async getUserPayments(userId) {
    return await PaymentRepository.findByUserId(userId);
  }

  static async getAllPayments({ page = 1, limit = 50 }) {
    const skip = (page - 1) * limit;
    return await PaymentRepository.findAll({ skip, take: limit });
  }
}
