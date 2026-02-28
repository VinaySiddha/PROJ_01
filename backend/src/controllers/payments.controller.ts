/**
 * @file Payments controller — Razorpay order creation and webhook handling
 * @module controllers/payments
 */
import { Request, Response, NextFunction } from 'express';
import { PaymentsService } from '../services/payments.service';
import { sendCreated } from '../utils/response';

/**
 * POST /api/payments/razorpay/order
 * Creates a Razorpay order for the advance payment of an existing booking.
 * Returns the order ID and key needed to initialise the Razorpay checkout modal on the frontend.
 *
 * @param req  - Express request with `{ bookingId: string }` body
 * @param res  - Express response
 * @param next - Express next function for error forwarding
 * @returns    void — responds with 201 and `{ orderId, amount, currency, keyId }` on success
 * @throws     NotFoundError if the booking does not exist
 * @throws     ExternalServiceError if Razorpay order creation fails
 */
export async function createRazorpayOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { bookingId } = req.body as { bookingId: string };
    const order = await PaymentsService.createRazorpayOrder(bookingId);
    sendCreated(res, order);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/payments/razorpay/webhook
 * Handles Razorpay webhook events. Signature verification is performed inside the service.
 * This route must receive the raw (unparsed) request body — do NOT apply JSON middleware here.
 *
 * @param req  - Express request; `req.rawBody` must be the raw Buffer set by the body-parser config
 * @param res  - Express response
 * @param next - Express next function for error forwarding
 * @returns    void — responds with 200 immediately after processing (Razorpay requires fast ACK)
 * @throws     ValidationError if the webhook signature is invalid
 */
export async function razorpayWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const rawBody = (req as Request & { rawBody?: Buffer })['rawBody'];

    if (!rawBody) {
      res.status(400).json({ success: false, message: 'Missing raw body' });
      return;
    }

    // PaymentsService expects a string for HMAC computation
    await PaymentsService.handleRazorpayWebhook(rawBody.toString('utf-8'), signature);

    // Razorpay requires a 200 response to acknowledge receipt
    res.status(200).json({ received: true });
  } catch (err) {
    next(err);
  }
}
