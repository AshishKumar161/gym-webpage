import { WorkoutService } from '../services/WorkoutService.js';
import { sendResponse } from '../utils/responseFormatter.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getMyWorkoutPlans = asyncHandler(async (req, res) => {
  const memberId = req.user.id;
  const plans = await WorkoutService.getMemberWorkoutPlans(memberId);
  return sendResponse(res, 200, 'Workout plans retrieved successfully.', plans);
});

export const getTrainerWorkoutPlans = asyncHandler(async (req, res) => {
  const trainerId = req.user.id;
  const plans = await WorkoutService.getTrainerWorkoutPlans(trainerId);
  return sendResponse(res, 200, 'Trainer workout plans retrieved successfully.', plans);
});

export const createWorkoutPlan = asyncHandler(async (req, res) => {
  const trainerId = req.user.id;
  const { title, memberId, dayOfWeek, notes, exercises } = req.body;
  const plan = await WorkoutService.createWorkoutPlan({ title, memberId, trainerId, dayOfWeek, notes }, exercises);
  return sendResponse(res, 201, 'Workout plan created successfully.', plan);
});

export const getWorkoutPlans = asyncHandler(async (req, res) => {
  const memberId = req.user?.id;
  const plans = await WorkoutService.getMemberWorkoutPlans(memberId);
  return sendResponse(res, 200, 'Workout plans retrieved successfully.', plans);
});

export const updateWorkoutPlan = asyncHandler(async (req, res) => {
  return sendResponse(res, 200, 'Workout plan updated successfully.');
});

export const deleteWorkoutPlan = asyncHandler(async (req, res) => {
  return sendResponse(res, 200, 'Workout plan deleted successfully.');
});

