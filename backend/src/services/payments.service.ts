/**
 * payments.service.ts
 * Handles Razorpay order creation and webhook processing.
 * PhonePe is a future addition — placeholder methods included.
 */
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { prisma } from '../prisma/client';
import { logger } from '../utils/logger';
import { AppError, ExternalServiceError, ValidationError } from '../utils/errors';
import { AuditService } from './audit.service';
import { WhatsAppService } from './whatsapp.service';
import { formatDate, formatSlot } from '../utils/formatters';
import { config } from '../config/index';

/** Razorpay client instance (initialized lazily on first use) */
let razorpay: Razorpay | null = null;

const getRazorpay = (): Razorpay => {
  if (!razorpay) {
    razorpay = new Razorpay({
      key_id:     config.RAZORPAY_KEY_ID,
      key_secret: config.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpay;
};

/** Advance amount collected at booking (in paisa — Razorpay uses smallest unit) */
const ADVANCE_AMOUNT_PAISA = 700 * 100; // Rs 700

export class PaymentsService {
  /**
   * Creates a Razorpay order for the advance payment.
   * The order amount is always Rs 700 (the advance charge).
   *
   * @param bookingId - Booking UUID (used as order receipt)
   * @returns         - Razorpay order object with order_id for the checkout modal
   */
  static async createRazorpayOrder(bookingId: string) {
    const booking = await prisma.booking.findFirst({ where: { id: bookingId } });
    if (!booking) throw new AppError('Booking not found.', 404, 'BOOKING_NOT_FOUND', 'low');

    try {
      const order = await getRazorpay().orders.create({
        amount:   ADVANCE_AMOUNT_PAISA,
        currency: 'INR',
        receipt:  bookingId.substring(0, 40), // Razorpay receipt max 40 chars
        notes:    { booking_id: bookingId, booking_ref: booking.booking_ref },
      });

      logger.info('Razorpay order created', {
        event:     'payment.order_created',
        bookingId,
        orderId:   order.id,
      });

      AuditService.log({
        actorType:    'system',
        action:       'payment.initiated',
        category:     'payment',
        resourceType: 'booking',
        resourceId:   bookingId,
        metadata:     { gateway: 'razorpay', orderId: order.id, amount: ADVANCE_AMOUNT_PAISA },
      });

      return { orderId: order.id, amount: ADVANCE_AMOUNT_PAISA, currency: 'INR', keyId: config.RAZORPAY_KEY_ID };
    } catch (err) {
      logger.error('Razorpay order creation failed', {
        event: 'payment.order_failed', bookingId, error: (err as Error).message,
      });
      throw new ExternalServiceError(
        'PAYMENT_ORDER_FAILED',
        'Could not initiate payment. Please try again.',
        { bookingId, gateway: 'razorpay' },
      );
    }
  }

  /**
   * Verifies a Razorpay payment webhook signature and confirms the booking.
   * CRITICAL: Always verify signature before processing — prevents fraud.
   *
   * @param rawBody   - Raw request body as string (for HMAC computation)
   * @param signature - Value from X-Razorpay-Signature header
   */
  static async handleRazorpayWebhook(rawBody: string, signature: string): Promise<void> {
    // Compute HMAC-SHA256 of raw body using webhook secret
    const expectedSignature = crypto
      .createHmac('sha256', config.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');

    // Constant-time comparison to prevent timing attacks
    const signaturesMatch = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );

    if (!signaturesMatch) {
      logger.error('Razorpay webhook signature mismatch — possible spoofed request', {
        event: 'payment.webhook_invalid_signature',
      });
      throw new ValidationError('PAYMENT_WEBHOOK_INVALID_SIG', 'Invalid webhook signature.');
    }

    const payload = JSON.parse(rawBody) as {
      event: string;
      payload: {
        payment: {
          entity: {
            id: string;
            order_id: string;
            notes: { booking_id?: string };
            amount: number;
            status: string;
          };
        };
      };
    };

    // Only process payment.captured events
    if (payload.event !== 'payment.captured') {
      logger.debug('Razorpay webhook: ignoring non-capture event', { event: payload.event });
      return;
    }

    const paymentEntity = payload.payload.payment.entity;
    const bookingId = paymentEntity.notes.booking_id;

    if (!bookingId) {
      logger.error('Razorpay webhook: missing booking_id in notes', { orderId: paymentEntity.order_id });
      return;
    }

    // Idempotency check — don't process the same payment twice
    const existingBooking = await prisma.booking.findFirst({ where: { id: bookingId } });
    if (!existingBooking) {
      logger.error('Razorpay webhook: booking not found', { bookingId });
      return;
    }

    if (existingBooking.status === 'confirmed') {
      logger.warn('Razorpay webhook: payment already processed (duplicate webhook)', { bookingId });
      return; // Idempotent — safe to ignore
    }

    // Confirm the booking
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data:  { status: 'confirmed', payment_id: paymentEntity.id, payment_gateway: 'razorpay' },
      include: {
        customer: true,
        theater:  { select: { name: true } },
        slot:     { select: { slot_name: true, start_time: true, end_time: true } },
      },
    });

    logger.info('Booking confirmed via Razorpay webhook', {
      event: 'payment.succeeded', bookingId, paymentId: paymentEntity.id,
    });

    AuditService.log({
      actorType:    'system',
      action:       'payment.succeeded',
      category:     'payment',
      resourceType: 'booking',
      resourceId:   bookingId,
      metadata: {
        gateway:   'razorpay',
        paymentId: paymentEntity.id,
        orderId:   paymentEntity.order_id,
        amount:    paymentEntity.amount,
      },
    });

    // Send booking confirmation via WhatsApp
    void WhatsAppService.sendBookingConfirmation({
      phone:       updatedBooking.customer.phone,
      name:        updatedBooking.customer.name ?? 'Customer',
      bookingRef:  updatedBooking.booking_ref,
      theaterName: updatedBooking.theater.name,
      date:        formatDate(updatedBooking.date),
      slot:        formatSlot(
        updatedBooking.slot.slot_name,
        updatedBooking.slot.start_time,
        updatedBooking.slot.end_time,
      ),
    });
  }
}
