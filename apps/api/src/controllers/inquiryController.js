import { sendResponse } from '../utils/responseFormatter.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createInquiry = asyncHandler(async (req, res) => {
  const { name, phone, message } = req.body;
  const inquiry = { id: 'inq_' + Date.now(), name, phone, message, status: 'pending', createdAt: new Date() };
  return sendResponse(res, 201, 'Inquiry submitted successfully! Our team will contact you shortly.', inquiry);
});

export const getInquiries = asyncHandler(async (req, res) => {
  return sendResponse(res, 200, 'Inquiries retrieved successfully.', []);
});

export const updateInquiryStatus = asyncHandler(async (req, res) => {
  return sendResponse(res, 200, `Inquiry status updated to ${req.body.status || 'resolved'}`);
});
