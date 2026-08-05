import { AttendanceRepository } from '../repositories/AttendanceRepository.js';

export class AttendanceService {
  static async checkIn(userId, method = 'QR_CODE') {
    const checkInTime = new Date().toLocaleTimeString('en-US', { hour12: false });
    return await AttendanceRepository.create({
      userId,
      checkInTime,
      method,
      status: 'PRESENT'
    });
  }

  static async getUserAttendance(userId, limit = 20) {
    return await AttendanceRepository.findByUserId(userId, limit);
  }

  static async getAllAttendance({ page = 1, limit = 50 }) {
    const skip = (page - 1) * limit;
    return await AttendanceRepository.findAll({ skip, take: limit });
  }
}
