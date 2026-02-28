/**
 * admin/dashboard.service.ts
 * Aggregates stats for the admin dashboard home page.
 * All queries are read-only and optimised with date range filters.
 */
import { prisma } from '../../prisma/client';

export class DashboardService {
  /**
   * Returns booking and revenue stats for today, this week, and this month.
   */
  static async getStats() {
    const now   = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today); weekStart.setDate(today.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [todayBookings, weekBookings, monthBookings, pendingReviews] = await Promise.all([
      prisma.booking.count({ where: { created_at: { gte: today }, status: { in: ['confirmed', 'completed'] } } }),
      prisma.booking.count({ where: { created_at: { gte: weekStart }, status: { in: ['confirmed', 'completed'] } } }),
      prisma.booking.count({ where: { created_at: { gte: monthStart }, status: { in: ['confirmed', 'completed'] } } }),
      prisma.review.count({ where: { is_approved: false } }),
    ]);

    const [todayRevenue, weekRevenue, monthRevenue] = await Promise.all([
      prisma.booking.aggregate({ where: { created_at: { gte: today }, status: { in: ['confirmed', 'completed'] } }, _sum: { advance_paid: true } }),
      prisma.booking.aggregate({ where: { created_at: { gte: weekStart }, status: { in: ['confirmed', 'completed'] } }, _sum: { advance_paid: true } }),
      prisma.booking.aggregate({ where: { created_at: { gte: monthStart }, status: { in: ['confirmed', 'completed'] } }, _sum: { advance_paid: true } }),
    ]);

    return {
      bookings: { today: todayBookings, week: weekBookings, month: monthBookings },
      revenue:  {
        today: todayRevenue._sum.advance_paid ?? 0,
        week:  weekRevenue._sum.advance_paid  ?? 0,
        month: monthRevenue._sum.advance_paid ?? 0,
      },
      pending_reviews: pendingReviews,
    };
  }

  /**
   * Returns upcoming bookings for today and tomorrow (for the dashboard timeline).
   */
  static async getUpcomingBookings() {
    const now      = new Date();
    const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 2);

    return prisma.booking.findMany({
      where: { date: { gte: now, lt: tomorrow }, status: 'confirmed' },
      select: {
        id: true, booking_ref: true, date: true, num_adults: true, num_children: true,
        theater: { select: { name: true } },
        slot: { select: { slot_name: true, start_time: true } },
        customer: { select: { name: true, phone: true } },
      },
      orderBy: [{ date: 'asc' }, { slot: { start_time: 'asc' } }],
      take: 20,
    });
  }
}
