/**
 * @file Auth controller — handles customer OTP flow and admin login
 * @module controllers/auth
 */
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { sendSuccess } from '../utils/response';

/**
 * POST /api/auth/otp/send
 * Sends a 6-digit OTP to the given phone number via WhatsApp.
 *
 * @param req  - Express request with `{ phone: string }` body
 * @param res  - Express response
 * @param next - Express next function for error forwarding
 * @returns    void — responds with 200 on success
 * @throws     RateLimitError if the phone has requested too many OTPs
 */
export async function sendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { phone } = req.body as { phone: string };
    await AuthService.sendOtp(phone);
    sendSuccess(res, null);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/otp/verify
 * Verifies the OTP for a phone number and returns a signed customer JWT.
 *
 * @param req  - Express request with `{ phone: string; otp: string }` body
 * @param res  - Express response
 * @param next - Express next function for error forwarding
 * @returns    void — responds with `{ token: string; isNewUser: boolean }` on success
 * @throws     ValidationError if OTP is wrong
 * @throws     UnauthorizedError if OTP is expired or max attempts exceeded
 */
export async function verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { phone, otp } = req.body as { phone: string; otp: string };
    const result = await AuthService.verifyOtp(phone, otp);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/admin/login
 * Authenticates an admin with email/password and returns a signed 8-hour JWT.
 *
 * @param req  - Express request with `{ email: string; password: string }` body
 * @param res  - Express response; `res.locals['requestId']` used as IP context
 * @param next - Express next function for error forwarding
 * @returns    void — responds with `{ token: string; admin: { id, email, role } }` on success
 * @throws     UnauthorizedError if credentials are invalid or admin is inactive
 */
export async function adminLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const ipAddress = req.ip;
    const result = await AuthService.loginAdmin(email, password, ipAddress);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}
