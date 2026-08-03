import prisma from '../config/prisma.js';

export class AttendanceRepository {
  static async create(attendanceData) {
    return await prisma.attendance.create({
      data: attendanceData
    });
  }

  static async findByUserId(userId, limit = 20) {
    return await prisma.attendance.findMany({
      where: { userId },
      take: limit,
      orderBy: { date: 'desc' }
    });
  }

  static async findAll({ skip = 0, take = 50 }) {
    const [records, total] = await Promise.all([
      prisma.attendance.findMany({
        skip,
        take,
        include: {
          user: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { date: 'desc' }
      }),
      prisma.attendance.count()
    ]);
    return { records, total };
  }

  static async countToday() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    return await prisma.attendance.count({
      where: {
        date: { gte: startOfDay }
      }
    });
  }
}
