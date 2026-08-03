import { UserService } from '../services/UserService.js';
import { sendResponse } from '../utils/responseFormatter.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import { ValidationError } from '../errors/AppError.js';

export const getMe = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id?.toString();
  const user = await UserService.getUserProfile(userId);
  return sendResponse(res, 200, 'User profile retrieved successfully.', user);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id?.toString();
  const { name, phone } = req.body;
  const updatedUser = await UserService.updateUserProfile(userId, { name, phone });
  return sendResponse(res, 200, 'Profile updated successfully.', updatedUser);
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ValidationError('Please upload an image file');
  }

  const result = await uploadToCloudinary(req.file.buffer, 'a2revampgym/avatars');
  const userId = req.user.id || req.user._id?.toString();
  const updatedUser = await UserService.updateUserProfile(userId, { avatar: result.secure_url });

  return sendResponse(res, 200, 'Avatar uploaded successfully.', { avatarUrl: result.secure_url, user: updatedUser });
});
