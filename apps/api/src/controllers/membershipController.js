import { MembershipService } from '../services/MembershipService.js';
import { sendResponse } from '../utils/responseFormatter.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getMemberships = asyncHandler(async (req, res) => {
  const plans = await MembershipService.getAllMemberships();
  return sendResponse(res, 200, 'Membership plans retrieved successfully.', plans);
});

export const getMembershipById = asyncHandler(async (req, res) => {
  const plan = await MembershipService.getMembershipById(req.params.id);
  return sendResponse(res, 200, 'Membership plan retrieved successfully.', plan);
});

export const createMembership = asyncHandler(async (req, res) => {
  const plan = await MembershipService.createMembership(req.body);
  return sendResponse(res, 201, 'Membership plan created successfully.', plan);
});

export const updateMembership = asyncHandler(async (req, res) => {
  const updatedPlan = await MembershipService.updateMembership(req.params.id, req.body);
  return sendResponse(res, 200, 'Membership plan updated successfully.', updatedPlan);
});

export const deleteMembership = asyncHandler(async (req, res) => {
  await MembershipService.deleteMembership(req.params.id);
  return sendResponse(res, 200, 'Membership plan deleted successfully.');
});
