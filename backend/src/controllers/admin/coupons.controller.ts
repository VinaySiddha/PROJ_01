/**
 * @file Admin coupons controller — create, list, disable coupon codes and validate at checkout
 * @module controllers/admin/coupons
 */
import { Request, Response, NextFunction } from 'express';
import { CouponsService, CreateCouponInput } from '../../services/admin/coupons.service';
import { sendSuccess, sendCreated } from '../../utils/response';
import { prisma } from '../../prisma/client';
import { ValidationError } from '../../utils/errors';

/**
 * GET /api/admin/coupons
 * Returns all coupon codes ordered by expiry date descending.
 *
 * @param req  - Express request
 * @param res  - Express response
 * @param next - Express next function for error forwarding
 * @returns    void — responds with an array of all coupon records including usage stats
 * @throws     AppError on database failure
 */
export async function listCoupons(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const coupons = await CouponsService.list();
    sendSuccess(res, coupons);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/coupons
 * Creates a new coupon code. Throws if the code is already taken.
 * The admin's ID is read from `res.locals['userId']` for the audit log.
 *
 * @param req  - Express request with a CreateCouponInput-shaped JSON body
 * @param res  - Express response; `res.locals['userId']` must be set by authenticateAdmin middleware
 * @param next - Express next function for error forwarding
 * @returns    void — responds with 201 and the created coupon record
 * @throws     ConflictError if the coupon code already exists
 */
export async function createCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const adminId = res.locals['userId'] as string;
    const coupon = await CouponsService.create(req.body as CreateCouponInput, adminId);
    sendCreated(res, coupon);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/coupons/:id/disable
 * Soft-disables a coupon so it can no longer be applied at checkout.
 * The admin's ID is read from `res.locals['userId']` for the audit log.
 *
 * @param req  - Express request; `req.params.id` is the coupon UUID
 * @param res  - Express response; `res.locals['userId']` must be set by authenticateAdmin middleware
 * @param next - Express next function for error forwarding
 * @returns    void — responds with the updated coupon record
 * @throws     NotFoundError if the coupon does not exist
 */
export async function disableCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const adminId = res.locals['userId'] as string;
    const coupon = await CouponsService.disable(id, adminId);
    sendSuccess(res, coupon);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/bookings/validate-coupon
 * Public endpoint — validates a coupon code against a given booking subtotal and returns
 * the discount amount if the coupon is valid and meets its minimum order requirement.
 *
 * @param req  - Express request with `{ code: string; bookingAmount: number }` body
 * @param res  - Express response
 * @param next - Express next function for error forwarding
 * @returns    void — responds with `{ valid: true, discountAmount, couponType }` on success
 * @throws     ValidationError if the coupon is invalid, expired, exhausted, or below minimum amount
 */
export async function validateCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { code, bookingAmount } = req.body as { code: string; bookingAmount: number };

    const coupon = await prisma.coupon.findFirst({
      where: { code, is_active: true },
    });

    if (!coupon) {
      throw new ValidationError('BOOKING_COUPON_INVALID', 'This coupon code is not valid.');
    }
    if (new Date() > coupon.valid_until) {
      throw new ValidationError('BOOKING_COUPON_EXPIRED', 'This coupon has expired.');
    }
    if (coupon.used_count >= coupon.max_uses) {
      throw new ValidationError('BOOKING_COUPON_MAX_USED', 'This coupon has reached its usage limit.');
    }
    if (bookingAmount < coupon.min_amount) {
      throw new ValidationError(
        'BOOKING_COUPON_MIN_AMOUNT',
        `Your booking total does not meet the minimum amount of \u20B9${coupon.min_amount} for this coupon.`,
      );
    }

    const discountAmount =
      coupon.type === 'percent'
        ? Math.floor(bookingAmount * (coupon.value / 100))
        : coupon.value;

    sendSuccess(res, {
      valid: true,
      discountAmount,
      couponType: coupon.type,
      couponValue: coupon.value,
    });
  } catch (err) {
    next(err);
  }
}
