import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, query: Record<string, string>) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) throw new NotFoundException('User not found');

    if (user.role === Role.ADMIN || user.role === Role.OWNER) {
      return this.getAdminDashboard();
    } else if (user.role === Role.TRAINER) {
      return this.getTrainerDashboard(userId);
    } else {
      return this.getMemberDashboard(userId);
    }
  }

  private async getAdminDashboard() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [
      totalMembers,
      activeMembers,
      totalTrainers,
      revenueAgg,
      recentPayments,
      recentMembers,
      attendanceToday,
      openTickets,
      plans,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: Role.MEMBER } }),
      this.prisma.membership.count({ where: { status: 'ACTIVE' } }),
      this.prisma.user.count({ where: { role: Role.TRAINER } }),
      this.prisma.payment.aggregate({
        where: { status: 'SUCCESS' },
        _sum: { amount: true },
      }),
      this.prisma.payment.findMany({
        where: { status: 'SUCCESS' },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { firstName: true, lastName: true, email: true },
          },
        },
      }),
      this.prisma.user.findMany({
        where: { role: Role.MEMBER },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true,
        },
      }),
      this.prisma.attendance.count({
        where: {
          checkInTime: { gte: todayStart },
        },
      }),
      this.prisma.contactInquiry.count({
        where: { status: 'PENDING' },
      }),
      this.prisma.membershipPlan.findMany({
        select: {
          id: true,
          name: true,
          color: true,
          _count: {
            select: {
              memberships: {
                where: { status: 'ACTIVE' },
              },
            },
          },
        },
      }),
    ]);

    // Calculate revenue trend for the last 6 months
    const payments = await this.prisma.payment.findMany({
      where: {
        status: 'SUCCESS',
        createdAt: { gte: sixMonthsAgo },
      },
      select: {
        amount: true,
        createdAt: true,
      },
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trendMap = new Map<string, number>();

    // Initialize map
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      trendMap.set(label, 0);
    }

    payments.forEach((payment) => {
      const pDate = new Date(payment.createdAt);
      const label = `${months[pDate.getMonth()]} ${pDate.getFullYear().toString().slice(-2)}`;
      if (trendMap.has(label)) {
        trendMap.set(label, trendMap.get(label)! + payment.amount / 100); // convert to major currency
      }
    });

    const revenueTrend = Array.from(trendMap.entries()).map(([month, amount]) => ({
      month,
      revenue: amount,
    }));

    return {
      stats: {
        totalMembers,
        activeMembers,
        totalTrainers,
        totalRevenue: (revenueAgg._sum.amount ?? 0) / 100, // convert paise to rupees
        attendanceToday,
        openTickets,
      },
      recentPayments,
      recentMembers,
      popularPlans: plans.map((p) => ({
        name: p.name,
        value: p._count.memberships,
        color: p.color,
      })),
      revenueTrend,
    };
  }

  private async getTrainerDashboard(trainerId: string) {
    const now = new Date();

    const [assignedMembers, upcomingBookings, completedBookings] = await Promise.all([
      this.prisma.trainerBooking.groupBy({
        by: ['memberId'],
        where: { trainerId, status: 'CONFIRMED' },
        _count: true,
      }).then(res => res.length),
      this.prisma.trainerBooking.findMany({
        where: {
          trainerId,
          status: 'CONFIRMED',
          scheduledAt: { gte: now },
        },
        take: 5,
        orderBy: { scheduledAt: 'asc' },
        include: {
          member: {
            select: { firstName: true, lastName: true, avatarUrl: true, email: true },
          },
        },
      }),
      this.prisma.trainerBooking.count({
        where: {
          trainerId,
          status: 'COMPLETED',
        },
      }),
    ]);

    return {
      stats: {
        assignedMembers,
        upcomingBookings: upcomingBookings.length,
        completedSessions: completedBookings,
      },
      upcomingBookings,
    };
  }

  private async getMemberDashboard(memberId: string) {
    const [attendanceCount, totalWorkouts, activeMembership, notifications] = await Promise.all([
      this.prisma.attendance.count({ where: { userId: memberId } }),
      this.prisma.workoutSession.count({ where: { userId: memberId, status: 'COMPLETED' } }),
      this.prisma.membership.findFirst({
        where: { userId: memberId, status: 'ACTIVE' },
        include: { plan: true },
        orderBy: { endDate: 'desc' },
      }),
      this.prisma.notification.findMany({
        where: { userId: memberId, isRead: false },
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      stats: {
        totalAttendance: attendanceCount,
        totalWorkouts,
        activeMembership,
      },
      notifications,
    };
  }

  async findOne(id: string, userId: string) {
    return null;
  }

  async create(userId: string, dto: any) {
    return null;
  }

  async update(id: string, userId: string, dto: any) {
    return null;
  }

  async remove(id: string, userId: string) {
    return null;
  }
}

