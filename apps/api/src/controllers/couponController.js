import { sendResponse } from '../utils/responseFormatter.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getCoupons = asyncHandler(async (req, res) => {
  return sendResponse(res, 200, 'Coupons retrieved successfully.', []);
});

export const createCoupon = asyncHandler(async (req, res) => {
  const { code, discountPercentage } = req.body;
  const coupon = { id: 'c_' + Date.now(), code, discountPercentage };
  return sendResponse(res, 201, 'Coupon created successfully.', coupon);
});

export const deleteCoupon = asyncHandler(async (req, res) => {
  return sendResponse(res, 200, 'Coupon deleted successfully.');
});
