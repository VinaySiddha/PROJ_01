/**
 * @file Cron jobs — 24h booking reminders and post-booking review requests
 * @module jobs/reminderJob
 */
import cron from 'node-cron';
import { prisma } from '../prisma/client';
import { logger } from '../utils/logger';
import { formatDate, formatTime } from '../utils/formatters';
import { WhatsAppService } from '../services/whatsapp.service';
import { ReviewsService } from '../services/reviews.service';

/**
 * Send 24-hour reminders to customers whose booking is tomorrow.
 * Runs every day at 10:00 AM.
 */
async function send24HourReminders(): Promise<void> {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDate = tomorrow.toISOString().split('T')[0]!;

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        date: new Date(tomorrowDate),
        status: 'confirmed',
        reminder_sent: false,
      },
      include: {
        customer: { select: { name: true, phone: true } },
        theater: { select: { name: true } },
        slot: { select: { slot_name: true, start_time: true } },
      },
    });

    logger.info(`Sending 24h reminders`, { count: bookings.length });

    for (const booking of bookings) {
      try {
        await WhatsAppService.send24HourReminder({
          phone: booking.customer.phone,
          name: booking.customer.name ?? 'Guest',
          theaterName: booking.theater.name,
          date: formatDate(booking.date),
          slot: `${booking.slot.slot_name} (${formatTime(booking.slot.start_time)})`,
          bookingRef: booking.booking_ref,
        });

        await prisma.booking.update({
          where: { id: booking.id },
          data: { reminder_sent: true },
        });
      } catch (err) {
        logger.warn(`Failed to send reminder for booking ${booking.booking_ref}`, { error: err });
      }
    }
  } catch (err) {
    logger.error('24h reminder job failed', { error: err });
  }
}

/**
 * Send review request to customers 2 hours after their slot ends.
 * Runs every hour.
 */
async function sendReviewRequests(): Promise<void> {
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        status: 'completed',
        review_request_sent: false,
        updated_at: {
          gte: fourHoursAgo,
          lte: twoHoursAgo,
        },
      },
      include: {
        customer: { select: { name: true, phone: true } },
        theater: { select: { name: true } },
      },
    });

    for (const booking of bookings) {
      try {
        const reviewToken = ReviewsService.generateReviewToken(booking.id, booking.customer_id);

        await WhatsAppService.sendReviewRequest({
          phone: booking.customer.phone,
          name: booking.customer.name ?? 'Guest',
          bookingRef: booking.booking_ref,
          reviewToken,
          frontendUrl: process.env['FRONTEND_URL'] ?? '',
        });

        await prisma.booking.update({
          where: { id: booking.id },
          data: { review_request_sent: true },
        });
      } catch (err) {
        logger.warn(`Failed to send review request for booking ${booking.booking_ref}`, { error: err });
      }
    }
  } catch (err) {
    logger.error('Review request job failed', { error: err });
  }
}

/**
 * Register all cron jobs.
 * Called from server.ts on startup.
 */
export function startReminderJob(): void {
  // Run 24h reminders every day at 10:00 AM
  cron.schedule('0 10 * * *', () => {
    void send24HourReminders();
  });

  // Run review requests every hour
  cron.schedule('0 * * * *', () => {
    void sendReviewRequests();
  });

  logger.info('Cron jobs registered: 24h reminders (10:00 AM daily), review requests (hourly)');
}
