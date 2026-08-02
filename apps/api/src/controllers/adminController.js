import User from '../models/User.js';
import Payment from '../models/Payment.js';
import Attendance from '../models/Attendance.js';

/**
 * @desc    Get Admin Dashboard High-Level Metrics & Revenue Stats
 * @route   GET /api/v1/admin/analytics
 * @access  Private/Admin
 */
export const getAdminAnalytics = async (req, res, next) => {
  try {
    const totalMembers = await User.countDocuments({ role: 'member' });
    const totalTrainers = await User.countDocuments({ role: 'trainer' });

    const totalRevenueResult = await Payment.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayCheckIns = await Attendance.countDocuments({
      createdAt: { $gte: todayStart }
    });

    res.status(200).json({
      success: true,
      data: {
        totalMembers,
        totalTrainers,
        totalRevenue,
        todayCheckIns
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users filtered by role
 * @route   GET /api/v1/admin/users
 * @access  Private/Admin
 */
export const getUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user role or status (Admin)
 * @route   PUT /api/v1/admin/users/:id
 * @access  Private/Admin
 */
export const updateUser = async (req, res, next) => {
  try {
    const { role, name, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role, name, phone },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete user (Admin)
 * @route   DELETE /api/v1/admin/users/:id
 * @access  Private/Admin
 */
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
