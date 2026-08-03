import { UserRepository } from '../repositories/UserRepository.js';
import { AttendanceRepository } from '../repositories/AttendanceRepository.js';
import { PaymentRepository } from '../repositories/PaymentRepository.js';

export class AnalyticsService {
  static async getDashboardMetrics() {
    const [totalUsers, totalRevenue, todayAttendance] = await Promise.all([
      UserRepository.count(),
      PaymentRepository.getTotalRevenue(),
      AttendanceRepository.countToday()
    ]);

    return {
      totalUsers,
      totalRevenue,
      todayAttendance
    };
  }
}
