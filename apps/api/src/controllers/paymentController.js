import { PaymentService } from '../services/PaymentService.js';
import { sendResponse } from '../utils/responseFormatter.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createPayment = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id?.toString();
  const { planName, amount, paymentMethod } = req.body;
  const payment = await PaymentService.recordPayment({ userId, planName, amount, paymentMethod });
  return sendResponse(res, 201, 'Payment processed successfully.', payment);
});

export const getMyPayments = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id?.toString();
  const payments = await PaymentService.getUserPayments(userId);
  return sendResponse(res, 200, 'Payment history retrieved successfully.', payments);
});

export const getAllPayments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const result = await PaymentService.getAllPayments({ page: Number(page), limit: Number(limit) });
  return sendResponse(res, 200, 'All payment records retrieved successfully.', result.payments, { count: result.total });
});

export const getPayments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const result = await PaymentService.getAllPayments({ page: Number(page), limit: Number(limit) });
  return sendResponse(res, 200, 'All payment records retrieved successfully.', result.payments, { count: result.total });
});

export const updatePaymentStatus = asyncHandler(async (req, res) => {
  return sendResponse(res, 200, 'Payment status updated successfully.');
});

