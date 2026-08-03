import { AnalyticsService } from '../services/AnalyticsService.js';
import { UserService } from '../services/UserService.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { sendResponse } from '../utils/responseFormatter.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { NotFoundError } from '../errors/AppError.js';

export const getAdminAnalytics = asyncHandler(async (req, res) => {
  const metrics = await AnalyticsService.getDashboardMetrics();
  return sendResponse(res, 200, 'Admin analytics retrieved successfully.', metrics);
});

export const getUsers = asyncHandler(async (req, res) => {
  const { role, page = 1, limit = 50 } = req.query;
  const result = await UserService.listUsers({ page: Number(page), limit: Number(limit), role });
  return sendResponse(res, 200, 'Users list retrieved successfully.', result.users, { count: result.total });
});

export const updateUser = asyncHandler(async (req, res) => {
  const { role, name, phone } = req.body;
  const user = await UserRepository.update(req.params.id, { role, name, phone });
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return sendResponse(res, 200, 'User updated successfully', user);
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await UserRepository.update(req.params.id, { isDeleted: true });
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return sendResponse(res, 200, 'User deleted successfully');
});
