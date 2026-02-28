/**
 * @file Auth routes — OTP send/verify and admin login
 * @module routes/auth
 */
import { Router } from 'express';
import { sendOtp, verifyOtp, adminLogin } from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { otpRateLimiter, adminLoginRateLimiter } from '../middleware/rateLimiter';
import { z } from 'zod';

const router = Router();

/** Zod schemas for auth endpoints */
const SendOtpSchema = z.object({ phone: z.string().regex(/^\+?[0-9]{10,13}$/, 'Invalid phone number') });
const VerifyOtpSchema = z.object({
  phone: z.string().regex(/^\+?[0-9]{10,13}$/),
  otp: z.string().length(6),
});
const AdminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// POST /api/auth/otp/send
router.post('/otp/send', otpRateLimiter, validate({ body: SendOtpSchema }), sendOtp);

// POST /api/auth/otp/verify
router.post('/otp/verify', otpRateLimiter, validate({ body: VerifyOtpSchema }), verifyOtp);

// POST /api/auth/admin/login
router.post('/admin/login', adminLoginRateLimiter, validate({ body: AdminLoginSchema }), adminLogin);

export default router;
