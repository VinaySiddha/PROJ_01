/**
 * @file Reviews controller — submit and list approved customer reviews
 * @module controllers/reviews
 */
import { Request, Response, NextFunction } from 'express';
import { ReviewsService } from '../services/reviews.service';
import { sendCreated, sendPaginated } from '../utils/response';

/**
 * GET /api/reviews?page=1&limit=12&theaterId=
 * Returns approved reviews, optionally filtered by theater.
 * Supports pagination via `page` and `limit` query params.
 *
 * @param req  - Express request; optional query params: `page`, `limit`, `theaterId`
 * @param res  - Express response
 * @param next - Express next function for error forwarding
 * @returns    void — responds with a paginated list of approved reviews
 * @throws     AppError on database failure
 */
export async function getApproved(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt((req.query['page'] as string) ?? '1', 10);
    const limit = parseInt((req.query['limit'] as string) ?? '12', 10);
    const theaterId = req.query['theaterId'] as string | undefined;

    const result = await ReviewsService.getApproved(theaterId, page, limit);
    sendPaginated(res, result.reviews, result.meta);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/reviews/submit
 * Submits a customer review using a one-time review token from the WhatsApp link.
 * The review is created in a pending state and requires admin approval before going live.
 *
 * @param req  - Express request with `{ token: string; rating: number; comment?: string }` body
 * @param res  - Express response
 * @param next - Express next function for error forwarding
 * @returns    void — responds with 201 and the created review on success
 * @throws     ValidationError if the token is invalid, expired, or the rating is out of range
 * @throws     NotFoundError if the linked booking does not exist or is not completed
 * @throws     ConflictError if a review has already been submitted for this booking
 */
export async function submitReview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { token, rating, comment } = req.body as {
      token: string;
      rating: number;
      comment?: string;
    };
    const review = await ReviewsService.submitReview(token, rating, comment);
    sendCreated(res, review);
  } catch (err) {
    next(err);
  }
}
