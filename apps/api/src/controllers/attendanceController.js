import Attendance from '../models/Attendance.js';

export const getAttendanceLogs = async (req, res, next) => {
  try {
    const filter = req.user.role === 'member' ? { member: req.user._id } : {};
    const logs = await Attendance.find(filter).populate('member', 'name email').sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    next(error);
  }
};

export const checkIn = async (req, res, next) => {
  try {
    const { method, memberId } = req.body;
    const targetMember = memberId || req.user._id;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const attendance = await Attendance.create({
      member: targetMember,
      date: now,
      checkInTime: timeStr,
      method: method || 'QR_CODE',
      status: 'present'
    });

    res.status(201).json({
      success: true,
      message: 'Check-in successful! Welcome to A² ReVamp Gym 💪',
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};
