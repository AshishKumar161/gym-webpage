import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

class BIService {
  
  /**
   * Executive Summary KPIs
   */
  async getExecutiveSummary() {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Revenue calculations
    const allPayments = await prisma.payment.findMany({ where: { status: 'PAID' } });
    const totalRevenue = allPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    
    const monthlyPayments = allPayments.filter(p => new Date(p.paidAt) >= firstDayOfMonth);
    const monthlyRevenue = monthlyPayments.reduce((sum, p) => sum + Number(p.amount), 0);

    // Member counts
    const activeMembersCount = await prisma.subscription.count({ where: { status: 'ACTIVE' } });
    const newRegistrations = await prisma.user.count({ 
      where: { role: 'MEMBER', createdAt: { gte: firstDayOfMonth } } 
    });

    // Subscriptions ending soon
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const expiringSoon = await prisma.subscription.count({
      where: { status: 'ACTIVE', endDate: { lte: nextWeek, gte: now } }
    });

    return {
      totalRevenue,
      monthlyRevenue,
      activeMembers: activeMembersCount,
      newRegistrations,
      expiringSoon,
      timestamp: now.toISOString()
    };
  }

  /**
   * Revenue Trends (Daily/Monthly)
   */
  async getRevenueTrends() {
    // Basic aggregation: grouping by day for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const payments = await prisma.payment.findMany({
      where: { status: 'PAID', paidAt: { gte: thirtyDaysAgo } },
      orderBy: { paidAt: 'asc' }
    });

    const dailyMap = {};
    payments.forEach(p => {
      const day = p.paidAt.toISOString().split('T')[0];
      dailyMap[day] = (dailyMap[day] || 0) + Number(p.amount);
    });

    return {
      labels: Object.keys(dailyMap),
      values: Object.values(dailyMap)
    };
  }

  /**
   * Membership Distribution
   */
  async getMembershipDistribution() {
    const plans = await prisma.subscription.groupBy({
      by: ['membershipId'],
      where: { status: 'ACTIVE' },
      _count: { id: true }
    });

    // Populate plan names
    const memberships = await prisma.membership.findMany();
    const map = {};
    memberships.forEach(m => map[m.id] = m.title);

    const labels = [];
    const values = [];

    plans.forEach(p => {
      labels.push(map[p.membershipId] || 'Unknown');
      values.push(p._count.id);
    });

    return { labels, values };
  }

  /**
   * Attendance Analytics
   */
  async getAttendanceAnalytics() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const attendance = await prisma.attendance.findMany({
      where: { status: 'PRESENT', date: { gte: sevenDaysAgo } }
    });

    const dailyMap = {};
    const peakHourMap = {};

    attendance.forEach(a => {
      const day = a.date.toISOString().split('T')[0];
      dailyMap[day] = (dailyMap[day] || 0) + 1;

      // Extract hour from checkInTime (e.g. "08:30 AM")
      let hourStr = a.checkInTime.split(':')[0];
      const isPM = a.checkInTime.toLowerCase().includes('pm');
      let hour = parseInt(hourStr, 10);
      if (isPM && hour !== 12) hour += 12;
      if (!isPM && hour === 12) hour = 0;
      
      const hourSlot = `${hour}:00`;
      peakHourMap[hourSlot] = (peakHourMap[hourSlot] || 0) + 1;
    });

    return {
      daily: {
        labels: Object.keys(dailyMap),
        values: Object.values(dailyMap)
      },
      peakHours: {
        labels: Object.keys(peakHourMap),
        values: Object.values(peakHourMap)
      }
    };
  }
}

export default new BIService();
