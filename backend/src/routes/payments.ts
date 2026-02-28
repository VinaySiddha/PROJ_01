/**
 * @file Payment routes — Razorpay order and webhook
 * @module routes/payments
 */
import { Router } from 'express';
import express from 'express';
import { createRazorpayOrder, razorpayWebhook } from '../controllers/payments.controller';
import { authenticateCustomer } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { z } from 'zod';

const router = Router();

const CreateOrderSchema = z.object({ bookingId: z.string().uuid() });

// Create Razorpay order (customer must be logged in)
router.post('/razorpay/order', authenticateCustomer, validate({ body: CreateOrderSchema }), createRazorpayOrder);

// Webhook: raw body needed for signature verification — must come BEFORE json middleware
// This route attaches raw body to req object
router.post(
  '/razorpay/webhook',
  express.raw({ type: 'application/json' }),
  razorpayWebhook,
);

export default router;
