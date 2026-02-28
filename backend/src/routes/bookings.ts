/**
 * @file Booking routes — create, view, cancel bookings
 * @module routes/bookings
 */
import { Router } from 'express';
import { createBooking, getMyBookings, getOne, cancelBooking } from '../controllers/bookings.controller';
import { authenticateCustomer, optionalAuthenticateCustomer } from '../middleware/auth.middleware';
import { bookingRateLimiter } from '../middleware/rateLimiter';
import { validateCoupon } from '../controllers/admin/coupons.controller';
import { validate } from '../middleware/validate.middleware';
import { z } from 'zod';

const router = Router();

const CreateBookingSchema = z.object({
  theaterId: z.string().uuid(),
  timeSlotId: z.string().uuid(),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  duration: z.enum(['standard', 'short']),
  occasion: z.string(),
  occasionName: z.string().optional(),
  guestCount: z.number().int().min(1).max(20),
  extraAdults: z.number().int().min(0).default(0),
  extraChildren: z.number().int().min(0).default(0),
  customerName: z.string().min(2),
  customerEmail: z.string().email().optional(),
  couponCode: z.string().optional(),
  addons: z.array(z.object({ addonId: z.string().uuid(), quantity: z.number().int().min(1) })).optional(),
  foodItems: z.array(z.object({ foodItemId: z.string().uuid(), quantity: z.number().int().min(1) })).optional(),
  cakeId: z.string().uuid().optional(),
  specialRequests: z.string().optional(),
});

const ValidateCouponSchema = z.object({
  code: z.string().min(3).max(20),
  bookingAmount: z.number().positive(),
});

router.post('/', authenticateCustomer, bookingRateLimiter, validate({ body: CreateBookingSchema }), createBooking);
router.get('/my', authenticateCustomer, getMyBookings);
router.get('/:id', optionalAuthenticateCustomer, getOne);
router.post('/:id/cancel', authenticateCustomer, cancelBooking);
router.post('/validate-coupon', validate({ body: ValidateCouponSchema }), validateCoupon);

export default router;
