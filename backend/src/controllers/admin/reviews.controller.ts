/**
 * @file Admin reviews controller — list all reviews and moderate (approve/reject)
 * @module controllers/admin/reviews
 */
import { Request, Response, NextFunction } from 'express';
import { ReviewsService } from '../../services/reviews.service';
import { sendSuccess, sendPaginated } from '../../utils/response';

/**
 * GET /api/admin/reviews?page=1&limit=20&status=pending
 * Returns a paginated list of all reviews for moderation.
 * Optionally filters by approval status: `pending`, `approved`, or `rejected`.
 *
 * @param req  - Express request; optional query params: `page`, `limit`, `status`
 * @param res  - Express response
 * @param next - Express next function for error forwarding
 * @returns    void — responds with a paginated list of reviews
 * @throws     AppError on database failure
 */
export async function listReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt((req.query['page'] as string) ?? '1', 10);
    const limit = parseInt((req.query['limit'] as string) ?? '20', 10);
    const status = req.query['status'] as 'pending' | 'approved' | 'rejected' | undefined;

    const result = await ReviewsService.listAll({ page, limit, status });
    sendPaginated(res, result.reviews, result.meta);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/reviews/:id/approve
 * Approves a review so it becomes publicly visible on the theater listing.
 * The admin's ID is read from `res.locals['userId']` for the audit log.
 *
 * @param req  - Express request; `req.params.id` is the review UUID
 * @param res  - Express response; `res.locals['userId']` must be set by authenticateAdmin middleware
 * @param next - Express next function for error forwarding
 * @returns    void — responds with the updated review record
 * @throws     NotFoundError if the review does not exist
 */
export async function approveReview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const adminId = res.locals['userId'] as string;
    const review = await ReviewsService.approve(id, adminId);
    sendSuccess(res, review);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/reviews/:id/reject
 * Permanently deletes a review that fails moderation standards.
 * The admin's ID is read from `res.locals['userId']` for the audit log.
 *
 * @param req  - Express request; `req.params.id` is the review UUID
 * @param res  - Express response; `res.locals['userId']` must be set by authenticateAdmin middleware
 * @param next - Express next function for error forwarding
 * @returns    void — responds with 200 and null data after deletion
 * @throws     NotFoundError if the review does not exist
 */
export async function rejectReview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const adminId = res.locals['userId'] as string;
    await ReviewsService.reject(id, adminId);
    sendSuccess(res, null);
  } catch (err) {
    next(err);
  }
}
