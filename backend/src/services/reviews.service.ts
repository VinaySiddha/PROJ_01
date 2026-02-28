/**
 * reviews.service.ts
 * Handles review submission (token-based), retrieval, and admin moderation.
 * Review tokens are single-use JWTs stored in the booking record.
 */
import { prisma } from '../prisma/client';
import { logger } from '../utils/logger';
import { NotFoundError, ConflictError, ValidationError } from '../utils/errors';
import { AuditService } from './audit.service';
import jwt from 'jsonwebtoken';
import { config } from '../config/index';

/** Shape of the review token JWT payload */
interface ReviewTokenPayload {
  bookingId: string;
  customerId: string;
  type: 'review';
}

export class ReviewsService {
  /**
   * Generates a one-time review token for a completed booking.
   * Used by the cron job when sending the post-slot WhatsApp message.
   *
   * @param bookingId  - Booking UUID
   * @param customerId - Customer UUID
   * @returns          - Signed JWT valid for 7 days
   */
  static generateReviewToken(bookingId: string, customerId: string): string {
    const payload: ReviewTokenPayload = { bookingId, customerId, type: 'review' };
    return jwt.sign(payload, config.JWT_SECRET, { expiresIn: '7d' });
  }

  /**
   * Submits a customer review using a one-time review token.
   *
   * @param token   - JWT review token from the WhatsApp link
   * @param rating  - Star rating (1–5)
   * @param comment - Optional review text
   */
  static async submitReview(token: string, rating: number, comment?: string) {
    // Verify and decode the review token
    let payload: ReviewTokenPayload;
    try {
      payload = jwt.verify(token, config.JWT_SECRET) as ReviewTokenPayload;
    } catch {
      throw new ValidationError('AUTH_TOKEN_INVALID', 'This review link is invalid or has expired.');
    }

    if (payload.type !== 'review') {
      throw new ValidationError('AUTH_TOKEN_INVALID', 'Invalid review token.');
    }

    // Check the booking exists and has been completed
    const booking = await prisma.booking.findFirst({
      where: { id: payload.bookingId, customer_id: payload.customerId, status: 'completed' },
      include: { customer: true },
    });

    if (!booking) {
      throw new NotFoundError('Booking', payload.bookingId);
    }

    // Prevent duplicate reviews (one per booking enforced by unique constraint)
    const existingReview = await prisma.review.findFirst({ where: { booking_id: payload.bookingId } });
    if (existingReview) {
      throw new ConflictError('REVIEW_ALREADY_SUBMITTED', 'You have already submitted a review for this booking.');
    }

    const review = await prisma.review.create({
      data: {
        booking_id:    payload.bookingId,
        theater_id:    booking.theater_id,
        customer_name: booking.customer.name ?? 'Guest',
        rating,
        comment:       comment ?? null,
        is_approved:   false, // Requires admin approval before going live
      },
    });

    logger.info('Review submitted', { event: 'review.submitted', reviewId: review.id, bookingId: payload.bookingId });
    return review;
  }

  /**
   * Returns approved reviews for a theater.
   *
   * @param theaterId - Theater UUID (optional — returns all if omitted)
   * @param page      - Page number (1-indexed)
   * @param limit     - Items per page
   */
  static async getApproved(theaterId?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = { is_approved: true, ...(theaterId ? { theater_id: theaterId } : {}) };

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        select: { id: true, customer_name: true, rating: true, comment: true, admin_reply: true, created_at: true },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      prisma.review.count({ where }),
    ]);

    return { reviews, meta: { total, page, limit } };
  }

  /**
   * Lists all reviews for admin moderation, optionally filtered by approval status.
   * `pending` maps to `is_approved = false`; `approved` maps to `is_approved = true`.
   * `rejected` is not a persisted state — rejected reviews are deleted — so it returns
   * an empty result set to keep the admin UI consistent without a schema change.
   *
   * @param options.page   - Page number (1-indexed)
   * @param options.limit  - Items per page
   * @param options.status - Optional filter: 'pending' | 'approved' | 'rejected'
   * @returns              - Paginated reviews with theater and booking ref, plus pagination meta
   */
  static async listAll(options: {
    page: number;
    limit: number;
    status?: 'pending' | 'approved' | 'rejected';
  }): Promise<{
    reviews: Awaited<ReturnType<typeof prisma.review.findMany>>;
    meta: { page: number; limit: number; total: number };
  }> {
    const { page, limit, status } = options;
    const skip = (page - 1) * limit;

    // Build where clause based on the requested status filter
    const where: Record<string, unknown> = {};
    if (status === 'pending') where['is_approved'] = false;
    else if (status === 'approved') where['is_approved'] = true;
    // 'rejected' reviews are permanently deleted — return empty result set

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          theater: { select: { name: true } },
          booking: { select: { booking_ref: true } },
        },
      }),
      prisma.review.count({ where }),
    ]);

    return { reviews, meta: { page, limit, total } };
  }

  /**
   * Approves a review (admin action).
   *
   * @param reviewId - Review UUID
   * @param adminId  - Admin performing the action (for audit log)
   */
  static async approve(reviewId: string, adminId: string) {
    const review = await prisma.review.findFirst({ where: { id: reviewId } });
    if (!review) throw new NotFoundError('Review', reviewId);

    const updated = await prisma.review.update({ where: { id: reviewId }, data: { is_approved: true } });

    AuditService.log({
      actorType: 'admin', actorId: adminId,
      action: 'review.approved', category: 'review',
      resourceType: 'review', resourceId: reviewId,
    });

    return updated;
  }

  /**
   * Rejects (deletes) a review (admin action).
   *
   * @param reviewId - Review UUID
   * @param adminId  - Admin performing the action (for audit log)
   */
  static async reject(reviewId: string, adminId: string) {
    const review = await prisma.review.findFirst({ where: { id: reviewId } });
    if (!review) throw new NotFoundError('Review', reviewId);

    await prisma.review.delete({ where: { id: reviewId } });

    AuditService.log({
      actorType: 'admin', actorId: adminId,
      action: 'review.rejected', category: 'review',
      resourceType: 'review', resourceId: reviewId,
    });
  }
}
