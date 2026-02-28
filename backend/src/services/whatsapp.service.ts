/**
 * whatsapp.service.ts
 *
 * Sends WhatsApp messages via the WATI Business API.
 * All methods are fire-and-forget from the caller's perspective — they can be awaited
 * but failures are caught, logged as warnings, and do NOT propagate to callers.
 *
 * Trigger events and message templates:
 *   1. OTP verification code
 *   2. Booking confirmation
 *   3. 24-hour slot reminder
 *   4. Post-slot review request (sent 2 hours after slot ends)
 *   5. Booking cancellation notification
 *   6. Payment failure with retry link
 */
import axios from 'axios';
import { config } from '../config/index';
import { logger } from '../utils/logger';
import { maskPhone } from '../utils/formatters';

/** WATI API base URL constructed from config */
const WATI_BASE = config.WATI_API_ENDPOINT;

/** Shared Axios headers for all WATI requests */
const watiHeaders = () => ({
  Authorization: `Bearer ${config.WATI_API_KEY}`,
  'Content-Type': 'application/json',
});

/**
 * Sends a WhatsApp message via the WATI API.
 * Internal helper — all public methods call this.
 *
 * @param phone   - Recipient phone with country code, no '+' prefix (e.g. '919948954545')
 * @param message - Plain text message body
 */
const sendWatiMessage = async (phone: string, message: string): Promise<void> => {
  await axios.post(
    `${WATI_BASE}/api/v1/sendSessionMessage/${phone}`,
    { message_text: message },
    { headers: watiHeaders(), timeout: 10_000 },
  );
};

export class WhatsAppService {
  /**
   * Sends a one-time OTP to the customer's WhatsApp number.
   * Called by AuthService.sendOtp().
   *
   * @param phone - Customer phone with country code prefix (e.g. '+919948954545')
   * @param otp   - 6-digit OTP string
   */
  static async sendOtpMessage(phone: string, otp: string): Promise<void> {
    // Normalize phone — WATI expects no '+' prefix
    const normalizedPhone = phone.replace(/^\+/, '');

    try {
      await sendWatiMessage(
        normalizedPhone,
        `Your CineNest verification code is: *${otp}*\n\nThis code expires in 5 minutes. Do not share it with anyone.`,
      );

      logger.info('WhatsApp OTP sent', { event: 'whatsapp.otp_sent', phone: maskPhone(phone) });
    } catch (err) {
      // OTP WhatsApp failure is critical — but don't crash the auth flow
      // The customer can request a new OTP
      logger.error('WhatsApp OTP send failed', {
        event: 'whatsapp.otp_failed',
        phone: maskPhone(phone),
        error: (err as Error).message,
      });
      // Re-throw so AuthService can handle it (may show alternate delivery method)
      throw err;
    }
  }

  /**
   * Sends a booking confirmation message after successful payment.
   *
   * @param phone     - Customer phone (with country code)
   * @param name      - Customer name
   * @param bookingRef - Booking reference number (e.g. 'CNB-A1B2C3D4')
   * @param theaterName - Theater name
   * @param date      - Formatted booking date (e.g. '15 Mar 2026')
   * @param slot      - Slot name and time (e.g. 'Evening · 5:00 PM – 9:00 PM')
   */
  static async sendBookingConfirmation(params: {
    phone: string;
    name: string;
    bookingRef: string;
    theaterName: string;
    date: string;
    slot: string;
  }): Promise<void> {
    const { phone, name, bookingRef, theaterName, date, slot } = params;
    const normalizedPhone = phone.replace(/^\+/, '');

    try {
      await sendWatiMessage(
        normalizedPhone,
        `🎬 *Booking Confirmed!*\n\nHi ${name}! Your CineNest booking is confirmed.\n\n📍 *Theater:* ${theaterName}\n📅 *Date:* ${date}\n🕐 *Slot:* ${slot}\n🎫 *Booking ID:* ${bookingRef}\n\nPlease bring your own OTT account credentials. See you soon! 🎉`,
      );

      logger.info('Booking confirmation WhatsApp sent', {
        event: 'whatsapp.booking_confirmed',
        bookingRef,
        phone: maskPhone(phone),
      });
    } catch (err) {
      // Non-critical — booking is already confirmed in DB
      logger.warn('WhatsApp booking confirmation failed — will retry via cron', {
        event:      'whatsapp.booking_confirmation_failed',
        bookingRef,
        phone:      maskPhone(phone),
        error:      (err as Error).message,
      });
    }
  }

  /**
   * Sends a 24-hour reminder before the booked slot.
   * Triggered by the nightly cron job.
   *
   * @param phone      - Customer phone (with country code)
   * @param name       - Customer name
   * @param bookingRef - Booking reference number
   * @param theaterName - Theater name
   * @param date       - Formatted booking date (e.g. '15 Mar 2026')
   * @param slot       - Slot name and time (e.g. 'Evening · 5:00 PM – 9:00 PM')
   */
  static async send24HourReminder(params: {
    phone: string;
    name: string;
    bookingRef: string;
    theaterName: string;
    date: string;
    slot: string;
  }): Promise<void> {
    const { phone, name, bookingRef, theaterName, date, slot } = params;
    const normalizedPhone = phone.replace(/^\+/, '');

    try {
      await sendWatiMessage(
        normalizedPhone,
        `⏰ *Reminder: Your CineNest experience is tomorrow!*\n\nHi ${name}! Just a reminder:\n\n📍 *Theater:* ${theaterName}\n📅 *Date:* ${date}\n🕐 *Slot:* ${slot}\n🎫 *Booking ID:* ${bookingRef}\n\n💡 Don't forget to bring your OTT account credentials (Netflix, Prime, etc.). See you soon! 🎬`,
      );

      logger.info('24hr reminder WhatsApp sent', { event: 'whatsapp.reminder_sent', bookingRef });
    } catch (err) {
      logger.warn('WhatsApp 24hr reminder failed', {
        event: 'whatsapp.reminder_failed',
        bookingRef,
        error: (err as Error).message,
      });
    }
  }

  /**
   * Sends a review request 2 hours after the slot ends.
   * Triggered by a cron job that checks for completed bookings.
   *
   * @param phone       - Customer phone (with country code)
   * @param name        - Customer name
   * @param bookingRef  - Booking reference number
   * @param reviewToken - One-time token for the review form URL
   * @param frontendUrl - Base URL of the frontend app (e.g. 'https://cinenest.in')
   */
  static async sendReviewRequest(params: {
    phone: string;
    name: string;
    bookingRef: string;
    reviewToken: string;
    frontendUrl: string;
  }): Promise<void> {
    const { phone, name, bookingRef, reviewToken, frontendUrl } = params;
    const normalizedPhone = phone.replace(/^\+/, '');
    const reviewUrl = `${frontendUrl}/review?token=${reviewToken}`;

    try {
      await sendWatiMessage(
        normalizedPhone,
        `⭐ *How was your CineNest experience?*\n\nHi ${name}! We hope you had an amazing time at CineNest (Booking: ${bookingRef}).\n\nWe'd love to hear your feedback! It only takes 30 seconds:\n${reviewUrl}\n\nYour review helps us improve! 🎬`,
      );

      logger.info('Review request WhatsApp sent', { event: 'whatsapp.review_request_sent', bookingRef });
    } catch (err) {
      logger.warn('WhatsApp review request failed', {
        event: 'whatsapp.review_request_failed',
        bookingRef,
        error: (err as Error).message,
      });
    }
  }

  /**
   * Sends a cancellation notification with refund information.
   *
   * @param phone        - Customer phone (with country code)
   * @param name         - Customer name
   * @param bookingRef   - Booking reference number
   * @param refundAmount - Refund amount in INR (0 means no refund applicable)
   */
  static async sendCancellationNotice(params: {
    phone: string;
    name: string;
    bookingRef: string;
    refundAmount: number;
  }): Promise<void> {
    const { phone, name, bookingRef, refundAmount } = params;
    const normalizedPhone = phone.replace(/^\+/, '');

    const refundLine = refundAmount > 0
      ? `💰 A refund of *₹${refundAmount}* will be processed within 7 working days.`
      : `ℹ️ No refund is applicable as the cancellation was made within 72 hours of the slot.`;

    try {
      await sendWatiMessage(
        normalizedPhone,
        `❌ *Booking Cancelled*\n\nHi ${name}, your booking *${bookingRef}* has been cancelled.\n\n${refundLine}\n\nHope to see you again soon! Book anytime at CineNest.`,
      );

      logger.info('Cancellation notice WhatsApp sent', { event: 'whatsapp.cancellation_sent', bookingRef });
    } catch (err) {
      logger.warn('WhatsApp cancellation notice failed', {
        event: 'whatsapp.cancellation_failed',
        bookingRef,
        error: (err as Error).message,
      });
    }
  }

  /**
   * Sends a payment failure message with a retry link.
   *
   * @param phone      - Customer phone (with country code)
   * @param name       - Customer name
   * @param bookingRef - Booking reference number
   * @param retryUrl   - URL for the customer to retry their payment
   */
  static async sendPaymentFailureNotice(params: {
    phone: string;
    name: string;
    bookingRef: string;
    retryUrl: string;
  }): Promise<void> {
    const { phone, name, bookingRef, retryUrl } = params;
    const normalizedPhone = phone.replace(/^\+/, '');

    try {
      await sendWatiMessage(
        normalizedPhone,
        `⚠️ *Payment Failed*\n\nHi ${name}, your payment for booking *${bookingRef}* could not be processed.\n\nPlease retry your payment:\n${retryUrl}\n\nNeed help? Contact us on WhatsApp.`,
      );

      logger.info('Payment failure WhatsApp sent', { event: 'whatsapp.payment_failed_sent', bookingRef });
    } catch (err) {
      logger.warn('WhatsApp payment failure notice failed', {
        event: 'whatsapp.payment_failed_send_failed',
        bookingRef,
        error: (err as Error).message,
      });
    }
  }
}
