import { sendResponse } from '../utils/responseFormatter.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getClasses = asyncHandler(async (req, res) => {
  return sendResponse(res, 200, 'Classes retrieved successfully.', []);
});

export const createClass = asyncHandler(async (req, res) => {
  const { title, description, category, startTime, endTime, days, maxCapacity } = req.body;
  const newClass = { id: 'cls_' + Date.now(), title, description, category, startTime, endTime, days, maxCapacity };
  return sendResponse(res, 201, 'Class scheduled successfully.', newClass);
});

export const bookClass = asyncHandler(async (req, res) => {
  return sendResponse(res, 200, 'Class booked successfully!');
});

export const deleteClass = asyncHandler(async (req, res) => {
  return sendResponse(res, 200, 'Class deleted successfully.');
});
