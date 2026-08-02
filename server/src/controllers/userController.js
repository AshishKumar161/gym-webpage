import User from '../models/User.js';
import { uploadToCloudinary } from '../config/cloudinary.js';

/**
 * @desc    Get Current User Profile
 * @route   GET /api/v1/users/me
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update User Profile
 * @route   PUT /api/v1/users/me
 * @access  Private
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone) user.phone = phone;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload Profile Avatar to Cloudinary
 * @route   POST /api/v1/users/me/avatar
 * @access  Private
 */
export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file' });
    }

    const result = await uploadToCloudinary(req.file.buffer, 'a2revampgym/avatars');
    const user = await User.findById(req.user._id);
    user.avatar = result.secure_url;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      avatarUrl: result.secure_url
    });
  } catch (error) {
    next(error);
  }
};
