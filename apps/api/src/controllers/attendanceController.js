import { AttendanceService } from '../services/AttendanceService.js';
import { sendResponse } from '../utils/responseFormatter.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const checkIn = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { method } = req.body;
  const attendance = await AttendanceService.checkIn(userId, method);
  return sendResponse(res, 201, 'Check-in recorded successfully.', attendance);
});

export const getMyAttendance = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const records = await AttendanceService.getUserAttendance(userId);
  return sendResponse(res, 200, 'Attendance history retrieved successfully.', records);
});

export const getAllAttendance = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const result = await AttendanceService.getAllAttendance({ page: Number(page), limit: Number(limit) });
  return sendResponse(res, 200, 'All attendance records retrieved successfully.', result.records, { count: result.total });
});

export const getAttendanceLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const result = await AttendanceService.getAllAttendance({ page: Number(page), limit: Number(limit) });
  return sendResponse(res, 200, 'Attendance logs retrieved successfully.', result.records, { count: result.total });
});

