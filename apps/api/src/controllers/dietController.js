import { DietService } from '../services/DietService.js';
import { sendResponse } from '../utils/responseFormatter.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getMyDietPlans = asyncHandler(async (req, res) => {
  const memberId = req.user.id || req.user._id?.toString();
  const plans = await DietService.getMemberDietPlans(memberId);
  return sendResponse(res, 200, 'Diet plans retrieved successfully.', plans);
});

export const getTrainerDietPlans = asyncHandler(async (req, res) => {
  const trainerId = req.user.id || req.user._id?.toString();
  const plans = await DietService.getTrainerDietPlans(trainerId);
  return sendResponse(res, 200, 'Trainer diet plans retrieved successfully.', plans);
});

export const createDietPlan = asyncHandler(async (req, res) => {
  const trainerId = req.user.id || req.user._id?.toString();
  const { title, memberId, dailyCaloriesTarget, waterIntakeLiters, instructions, meals } = req.body;
  const plan = await DietService.createDietPlan({ title, memberId, trainerId, dailyCaloriesTarget, waterIntakeLiters, instructions }, meals);
  return sendResponse(res, 201, 'Diet plan created successfully.', plan);
});
