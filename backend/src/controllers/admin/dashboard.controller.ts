/**
 * @file Admin dashboard controller — booking and revenue stats overview
 * @module controllers/admin/dashboard
 */
import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../../services/admin/dashboard.service';
import { sendSuccess } from '../../utils/response';

/**
 * GET /api/admin/dashboard/stats
 * Returns booking counts and revenue totals for today, this week, and this month,
 * along with the count of pending reviews awaiting moderation.
 *
 * @param req  - Express request
 * @param res  - Express response
 * @param next - Express next function for error forwarding
 * @returns    void — responds with `{ bookings, revenue, pending_reviews }` stats object
 * @throws     AppError on database failure
 */
export async function getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const stats = await DashboardService.getStats();
    sendSuccess(res, stats);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/dashboard/upcoming
 * Returns upcoming confirmed bookings for today and tomorrow, ordered by date and slot time.
 * Used to populate the dashboard timeline view.
 *
 * @param req  - Express request
 * @param res  - Express response
 * @param next - Express next function for error forwarding
 * @returns    void — responds with an array of upcoming booking summaries (max 20)
 * @throws     AppError on database failure
 */
export async function getUpcomingBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const bookings = await DashboardService.getUpcomingBookings();
    sendSuccess(res, bookings);
  } catch (err) {
    next(err);
  }
}
