/**
 * rateLimiter.ts
 *
 * Pre-configured express-rate-limit instances for different endpoint categories.
 * Each limiter has different thresholds based on the sensitivity of the endpoint.
 *
 * Rate limit headers are included in responses so clients can implement backoff.
 */
import rateLimit from 'express-rate-limit';

/**
 * OTP endpoint rate limiter.
 * Prevents brute-force OTP attacks and abuse of the WhatsApp messaging quota.
 * Limit: 3 OTP requests per phone number per 10 minutes.
 * Note: The IP-based limit here is supplementary; phone-based limits are in auth.service.ts.
 */
export const otpRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10-minute window
  max: 5,                    // Max 5 requests per IP per window (phone-level is stricter: 3)
  standardHeaders: true,     // Return rate limit info in RateLimit-* headers
  legacyHeaders: false,      // Disable deprecated X-RateLimit-* headers
  message: {
    success: false,
    error: {
      code: 'AUTH_OTP_RATE_LIMITED',
      message: 'Too many OTP requests. Please wait before trying again.',
    },
  },
});

/**
 * Booking creation rate limiter.
 * Prevents automated booking spam and slot-lock abuse.
 * Limit: 5 booking attempts per IP per minute.
 */
export const bookingRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1-minute window
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many booking attempts. Please slow down.',
    },
  },
});

/**
 * Admin login rate limiter.
 * Prevents brute-force attacks on admin credentials.
 * Limit: 10 failed attempts per IP per hour, then blocked for 30 minutes.
 */
export const adminLoginRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1-hour window
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  // Skip counting successful responses — only count 401s
  skipSuccessfulRequests: true,
  message: {
    success: false,
    error: {
      code: 'AUTH_ADMIN_LOCKED',
      message: 'Too many failed login attempts. Please try again in 30 minutes.',
    },
  },
});

/**
 * General API rate limiter applied to all routes.
 * Provides a broad protection layer against DDoS and crawlers.
 * Limit: 100 requests per IP per minute.
 */
export const generalRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1-minute window
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please slow down.',
    },
  },
});
