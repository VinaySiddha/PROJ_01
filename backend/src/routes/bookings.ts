/**
 * @file Booking routes — create, view, cancel bookings
 * @module routes/bookings
 */
import { Router } from 'express';
import {
  createBooking,
  getBookingByRef,
  getMyBookings,
  getOne,
  cancelBooking,
  submitUpiPayment,
} from '../controllers/bookings.controller';
import { optionalAuthenticateCustomer, authenticateCustomer } from '../middleware/auth.middleware';
import { bookingRateLimiter } from '../middleware/rateLimiter';
import { validateCoupon } from '../controllers/admin/coupons.controller';
import { validate } from '../middleware/validate.middleware';
import { z } from 'zod';

const router = Router();

// ── Schemas ────────────────────────────────────────────────────────────────────

const CreateBookingSchema = z.object({
  theater_id:    z.string().uuid(),
  slot_id:       z.string().uuid(),
  date:          z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  duration_type: z.enum(['standard', 'short']).default('standard'),
  num_adults:    z.number().int().min(1).max(20).default(2),
  num_children:  z.number().int().min(0).max(20).default(0),
  occasion:      z.string().optional(),
  occasion_name: z.string().optional(),
  cake_id:       z.string().uuid().optional().nullable(),
  addon_ids:     z.array(z.string().uuid()).default([]),
  food_items:    z.array(z.object({
    food_item_id: z.string().uuid(),
    variant_size: z.string().optional(),
    quantity:     z.number().int().min(1),
  })).default([]),
  customer_name:  z.string().min(2),
  customer_phone: z.string().regex(/^\+?[0-9]{10,13}$/, 'Invalid phone number'),
  customer_email: z.string().email().optional().nullable(),
  coupon_code:    z.string().optional(),
  referral_code:  z.string().optional(),
});

const UpiPaymentSchema = z.object({
  utr: z.string().min(6, 'Enter a valid UPI transaction reference (UTR)'),
});

const ValidateCouponSchema = z.object({
  code:          z.string().min(3).max(20),
  bookingAmount: z.number().positive(),
});

// ── Routes ─────────────────────────────────────────────────────────────────────

// Guest booking — no auth required; customer is found/created from phone
router.post(
  '/',
  bookingRateLimiter,
  validate({ body: CreateBookingSchema }),
  createBooking,
);

// Submit UPI payment proof (UTR reference) for a pending booking
router.patch(
  '/:id/upi-payment',
  validate({ body: UpiPaymentSchema }),
  submitUpiPayment,
);

// Public booking status lookup by booking reference (no auth)
router.get('/ref/:bookingRef', getBookingByRef);

// Authenticated customer routes
router.get('/my', authenticateCustomer, getMyBookings);
router.get('/:id', optionalAuthenticateCustomer, getOne);
router.post('/:id/cancel', authenticateCustomer, cancelBooking);

// Coupon validation
router.post('/validate-coupon', validate({ body: ValidateCouponSchema }), validateCoupon);

export default router;
