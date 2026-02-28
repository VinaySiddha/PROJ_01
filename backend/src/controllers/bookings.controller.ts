/**
 * @file Bookings controller — create, view, and cancel customer bookings
 * @module controllers/bookings
 */
import { Request, Response, NextFunction } from 'express';
import { BookingsService, CreateBookingInput } from '../services/bookings.service';
import { sendSuccess, sendCreated } from '../utils/response';

/**
 * POST /api/bookings
 * Creates a new booking for the authenticated customer.
 * The customer ID is injected from `res.locals['userId']` set by authenticateCustomer middleware.
 *
 * @param req  - Express request; body must conform to CreateBookingInput (minus customerId)
 * @param res  - Express response; `res.locals['userId']` must be set by auth middleware
 * @param next - Express next function for error forwarding
 * @returns    void — responds with 201 and the created booking on success
 * @throws     NotFoundError if theater or slot does not exist
 * @throws     ValidationError if capacity, coupon, or business rules are violated
 * @throws     ConflictError if the slot is already locked or booked
 */
export async function createBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const customerId = res.locals['userId'] as string;
    const input: CreateBookingInput = {
      ...(req.body as Omit<CreateBookingInput, 'customerId' | 'ipAddress'>),
      customerId,
      ipAddress: req.ip,
    };
    const booking = await BookingsService.createBooking(input);
    sendCreated(res, booking);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/bookings/my
 * Returns all bookings for the currently authenticated customer.
 *
 * @param req  - Express request
 * @param res  - Express response; `res.locals['userId']` must be set by auth middleware
 * @param next - Express next function for error forwarding
 * @returns    void — responds with an array of booking summaries
 * @throws     AppError on database failure
 */
export async function getMyBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
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
 * Returns a single booking by ID. If a customer JWT is present, ownership is verified.
 *
 * @param req  - Express request; `req.params.id` is the booking UUID
 * @param res  - Express response; `res.locals['userId']` may be set by optional auth middleware
 * @param next - Express next function for error forwarding
 * @returns    void — responds with the full booking detail object
 * @throws     NotFoundError if the booking does not exist or does not belong to the customer
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
 * A refund is issued if the cancellation is within the allowed window (72 hours before slot).
 *
 * @param req  - Express request; `req.params.id` is the booking UUID
 * @param res  - Express response; `res.locals['userId']` must be set by auth middleware
 * @param next - Express next function for error forwarding
 * @returns    void — responds with `{ refundAmount, booking }` on success
 * @throws     NotFoundError if the booking does not exist or does not belong to the customer
 * @throws     ConflictError if the booking is already cancelled
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
