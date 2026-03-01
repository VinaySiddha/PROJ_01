/**
 * @file Bookings controller — create, view, and cancel customer bookings
 * @module controllers/bookings
 */
import { Request, Response, NextFunction } from 'express';
import { BookingsService, CreateBookingInput } from '../services/bookings.service';
import { prisma } from '../prisma/client';
import { sendSuccess, sendCreated } from '../utils/response';
import { NotFoundError, ValidationError } from '../utils/errors';

/**
 * POST /api/bookings
 * Creates a new booking. Works as a guest endpoint — no JWT required.
 * The customer is found or created from the phone number in the request body.
 */
export async function createBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = req.body as {
      theater_id:    string;
      slot_id:       string;
      date:          string;
      duration_type: 'standard' | 'short';
      num_adults:    number;
      num_children:  number;
      occasion?:     string;
      occasion_name?: string;
      cake_id?:      string | null;
      addon_ids:     string[];
      food_items:    { food_item_id: string; variant_size?: string; quantity: number }[];
      customer_name:  string;
      customer_phone: string;
      customer_email?: string | null;
      coupon_code?:   string;
      referral_code?: string;
    };

    // Find or create customer from phone number
    let customer = await prisma.customer.findUnique({
      where: { phone: body.customer_phone },
    });
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          phone: body.customer_phone,
          name:  body.customer_name,
          email: body.customer_email ?? null,
        },
      });
    } else if (!customer.name && body.customer_name) {
      // Update name if previously unknown
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data:  { name: body.customer_name, email: body.customer_email ?? customer.email },
      });
    }

    const input: CreateBookingInput = {
      theaterId:    body.theater_id,
      customerId:   customer.id,
      date:         body.date,
      slotId:       body.slot_id,
      durationType: body.duration_type,
      numAdults:    body.num_adults,
      numChildren:  body.num_children,
      occasion:     body.occasion,
      occasionName: body.occasion_name,
      cakeId:       body.cake_id ?? undefined,
      addonIds:     body.addon_ids,
      foodItems:    body.food_items.map((f) => ({
        foodItemId:  f.food_item_id,
        variantSize: f.variant_size,
        quantity:    f.quantity,
      })),
      couponCode:   body.coupon_code,
      referralCode: body.referral_code,
      ipAddress:    req.ip,
    };

    const booking = await BookingsService.createBooking(input);
    sendCreated(res, booking);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/bookings/:id/upi-payment
 * Saves the customer's UPI transaction reference (UTR) for a pending booking.
 * No auth required — booking ID is the implicit identifier.
 */
export async function submitUpiPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const { utr } = req.body as { utr: string };

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundError('Booking', id);
    if (booking.status !== 'pending') {
      throw new ValidationError('BOOKING_ALREADY_PAID', 'This booking has already been processed.');
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        payment_id:      utr,
        payment_gateway: 'upi',
        notes:           `UPI UTR: ${utr}`,
      },
    });

    sendSuccess(res, { booking_ref: updated.booking_ref, status: updated.status });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/bookings/ref/:bookingRef
 * Public booking status lookup — no auth required.
 * Returns status, theater, date, and slot info.
 */
export async function getBookingByRef(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { bookingRef } = req.params as { bookingRef: string };

    const booking = await prisma.booking.findUnique({
      where: { booking_ref: bookingRef.toUpperCase() },
      include: {
        theater:  { select: { name: true, location: { select: { name: true } } } },
        slot:     { select: { slot_name: true, start_time: true, end_time: true } },
        customer: { select: { name: true } },
      },
    });

    if (!booking) throw new NotFoundError('Booking', bookingRef);

    sendSuccess(res, {
      booking_ref:   booking.booking_ref,
      status:        booking.status,
      date:          booking.date,
      theater_name:  booking.theater.name,
      location_name: booking.theater.location.name,
      slot_name:     booking.slot.slot_name,
      start_time:    booking.slot.start_time,
      end_time:      booking.slot.end_time,
      customer_name: booking.customer.name,
      total_amount:  booking.total_amount,
      advance_paid:  booking.advance_paid,
      occasion:      booking.occasion,
      occasion_name: booking.occasion_name,
      payment_id:    booking.payment_id,
      payment_gateway: booking.payment_gateway,
      created_at:    booking.created_at,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/bookings/my
 * Returns all bookings for the authenticated customer.
 */
export async function getMyBookings(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const customerId = res.locals['userId'] as string;
    const bookings = await BookingsService.getCustomerBookings(customerId);
    sendSuccess(res, bookings);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/bookings/:id
 * Returns a single booking by ID.
 */
export async function getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const customerId = res.locals['userId'] as string | undefined;
    const booking = await BookingsService.getBooking(id, customerId);
    sendSuccess(res, booking);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/bookings/:id/cancel
 * Cancels a booking on behalf of the authenticated customer.
 */
export async function cancelBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const customerId = res.locals['userId'] as string;
    const result = await BookingsService.cancelBooking(id, {
      customerId,
      cancelledBy: 'customer',
      ipAddress: req.ip,
    });
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}
