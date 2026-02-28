/**
 * auth.service.ts
 *
 * Handles customer authentication via WhatsApp OTP and admin authentication via email/password.
 * JWT tokens are signed with HS256. Customer tokens last 7 days. Admin tokens last 8 hours.
 *
 * OTP flow:
 *   1. sendOtp(phone)         — generates 6-digit OTP, stores in Redis with 5-min TTL, sends via WATI
 *   2. verifyOtp(phone, otp)  — checks Redis, creates/finds customer, returns JWT
 */
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '../prisma/client';
import { redis } from '../redis/client';
import { config } from '../config/index';
import { logger } from '../utils/logger';
import { maskPhone } from '../utils/formatters';
import {
  ValidationError,
  UnauthorizedError,
  RateLimitError,
  NotFoundError,
} from '../utils/errors';
import { WhatsAppService } from './whatsapp.service';
import { AuditService } from './audit.service';

/** Redis key pattern for OTP storage */
const OTP_KEY = (phone: string) => `otp:${phone}`;
/** Redis key pattern for OTP attempt counting */
const OTP_ATTEMPTS_KEY = (phone: string) => `otp_attempts:${phone}`;
/** Redis key pattern for OTP send rate limiting per phone */
const OTP_SEND_COUNT_KEY = (phone: string) => `otp_send_count:${phone}`;

/** OTP time-to-live in seconds (5 minutes) */
const OTP_TTL = 5 * 60;
/** Max wrong OTP attempts before lockout */
const MAX_OTP_ATTEMPTS = 3;
/** Max OTPs that can be sent per phone per 10 minutes */
const MAX_OTP_SENDS = 3;
/** OTP send rate window in seconds (10 minutes) */
const OTP_SEND_WINDOW = 10 * 60;

/** JWT payload shape for customer tokens */
interface CustomerTokenPayload {
  sub: string;
  phone: string;
  type: 'customer';
}

/** JWT payload shape for admin tokens */
interface AdminTokenPayload {
  sub: string;
  email: string;
  role: string;
  type: 'admin';
}

export class AuthService {
  /**
   * Generates a 6-digit OTP, stores it in Redis, and sends it via WhatsApp.
   * Enforces phone-level rate limiting: max 3 OTPs per phone per 10 minutes.
   *
   * @param phone - Customer's phone number (e.g. '+919948954545')
   * @throws RateLimitError if the phone has requested too many OTPs
   */
  static async sendOtp(phone: string): Promise<void> {
    // Check how many OTPs have been sent to this phone in the current window
    const sendCount = await redis.get(OTP_SEND_COUNT_KEY(phone));
    const currentCount = sendCount ? parseInt(sendCount, 10) : 0;

    if (currentCount >= MAX_OTP_SENDS) {
      // Phone has hit the send limit — reject before generating a new OTP
      throw new RateLimitError(
        'AUTH_OTP_RATE_LIMITED',
        'Too many OTP requests. Please wait 10 minutes before trying again.',
      );
    }

    // Generate a cryptographically random 6-digit OTP
    const otp = Math.floor(100_000 + Math.random() * 900_000).toString();

    // Store OTP in Redis with 5-minute TTL
    // NX flag ensures we don't overwrite an OTP the user hasn't used yet
    await redis.setex(OTP_KEY(phone), OTP_TTL, otp);

    // Increment the send counter; set TTL on first send to define the rate window
    if (currentCount === 0) {
      await redis.setex(OTP_SEND_COUNT_KEY(phone), OTP_SEND_WINDOW, '1');
    } else {
      await redis.incr(OTP_SEND_COUNT_KEY(phone));
    }

    // Reset attempt counter whenever a new OTP is issued
    await redis.del(OTP_ATTEMPTS_KEY(phone));

    // Send OTP via WhatsApp — fire-and-forget; failure is logged, not thrown
    await WhatsAppService.sendOtpMessage(phone, otp);

    logger.info('OTP sent successfully', {
      event: 'auth.otp_sent',
      phone: maskPhone(phone), // Mask phone in logs
    });

    // Audit: OTP requested
    AuditService.log({
      actorType: 'customer',
      action:    'auth.otp_requested',
      category:  'auth',
      metadata:  { phone: maskPhone(phone) },
    });
  }

  /**
   * Verifies an OTP for a phone number. On success, creates or finds the customer
   * record and returns a signed JWT.
   *
   * @param phone - Customer's phone number
   * @param otp   - 6-digit OTP entered by the customer
   * @returns     - Signed JWT string for the customer
   * @throws ValidationError if OTP is wrong
   * @throws UnauthorizedError if OTP is expired or max attempts exceeded
   */
  static async verifyOtp(phone: string, otp: string): Promise<{ token: string; isNewUser: boolean }> {
    // Check how many wrong attempts have been made for this phone
    const attemptsRaw = await redis.get(OTP_ATTEMPTS_KEY(phone));
    const attempts = attemptsRaw ? parseInt(attemptsRaw, 10) : 0;

    if (attempts >= MAX_OTP_ATTEMPTS) {
      throw new RateLimitError(
        'AUTH_OTP_MAX_ATTEMPTS',
        'Too many incorrect attempts. Please request a new OTP.',
      );
    }

    // Retrieve the stored OTP from Redis
    const storedOtp = await redis.get(OTP_KEY(phone));

    if (!storedOtp) {
      // OTP not found — either never requested or TTL expired
      throw new UnauthorizedError('AUTH_OTP_EXPIRED', 'Your OTP has expired. Please request a new one.');
    }

    if (storedOtp !== otp) {
      // Wrong OTP — increment attempt counter and reject
      await redis.incr(OTP_ATTEMPTS_KEY(phone));
      // Set TTL on attempts key matching OTP TTL so it auto-clears
      await redis.expire(OTP_ATTEMPTS_KEY(phone), OTP_TTL);

      throw new ValidationError('AUTH_OTP_INVALID', 'The OTP you entered is incorrect.');
    }

    // Correct OTP — clean up Redis keys immediately
    await redis.del(OTP_KEY(phone));
    await redis.del(OTP_ATTEMPTS_KEY(phone));
    await redis.del(OTP_SEND_COUNT_KEY(phone));

    // Find existing customer or create a new one
    let isNewUser = false;
    let customer = await prisma.customer.findUnique({ where: { phone } });

    if (!customer) {
      customer = await prisma.customer.create({ data: { phone } });
      isNewUser = true;
    }

    // Sign a 7-day JWT for the customer
    const payload: CustomerTokenPayload = {
      sub:   customer.id,
      phone: customer.phone,
      type:  'customer',
    };

    const token = jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRES_IN as string,
    });

    logger.info('Customer OTP verified — login success', {
      event:    'auth.otp_verified',
      phone:    maskPhone(phone),
      isNewUser,
    });

    AuditService.log({
      actorType:  'customer',
      actorId:    customer.id,
      action:     'auth.otp_verified',
      category:   'auth',
      metadata:   { phone: maskPhone(phone), isNewUser },
    });

    return { token, isNewUser };
  }

  /**
   * Authenticates an admin with email and password.
   * Returns a signed 8-hour JWT on success.
   *
   * @param email    - Admin email address
   * @param password - Plain-text password (compared against bcrypt hash)
   * @returns        - Signed JWT string and admin info
   * @throws UnauthorizedError if credentials are invalid
   */
  static async loginAdmin(
    email: string,
    password: string,
    ipAddress?: string,
  ): Promise<{ token: string; admin: { id: string; email: string; role: string } }> {
    // Find the admin by email — include is_active check
    const admin = await prisma.admin.findFirst({
      where: { email, is_active: true },
    });

    if (!admin) {
      // Use a generic message — don't reveal whether email exists
      AuditService.log({
        actorType: 'system',
        action:    'auth.admin_login_failed',
        category:  'auth',
        metadata:  { email, reason: 'email_not_found' },
        ipAddress,
      });
      throw new UnauthorizedError('AUTH_ADMIN_INVALID_CREDS', 'Incorrect email or password.');
    }

    // Verify password against stored bcrypt hash
    const passwordMatch = await bcrypt.compare(password, admin.password_hash);

    if (!passwordMatch) {
      AuditService.log({
        actorType: 'admin',
        actorId:   admin.id,
        action:    'auth.admin_login_failed',
        category:  'auth',
        metadata:  { email, reason: 'wrong_password' },
        ipAddress,
      });
      throw new UnauthorizedError('AUTH_ADMIN_INVALID_CREDS', 'Incorrect email or password.');
    }

    // Update last_login timestamp
    await prisma.admin.update({
      where: { id: admin.id },
      data:  { last_login: new Date() },
    });

    // Sign an 8-hour JWT for the admin
    const payload: AdminTokenPayload = {
      sub:   admin.id,
      email: admin.email,
      role:  admin.role,
      type:  'admin',
    };

    const token = jwt.sign(payload, config.JWT_SECRET, { expiresIn: '8h' });

    logger.info('Admin login successful', {
      event:   'auth.admin_login_success',
      adminId: admin.id,
      role:    admin.role,
    });

    AuditService.log({
      actorType: 'admin',
      actorId:   admin.id,
      action:    'auth.admin_login_success',
      category:  'auth',
      metadata:  { email, role: admin.role },
      ipAddress,
    });

    return {
      token,
      admin: { id: admin.id, email: admin.email, role: admin.role },
    };
  }
}
