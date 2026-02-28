/**
 * @file Review routes — submit and list public reviews
 * @module routes/reviews
 */
import { Router } from 'express';
import { getApproved, submitReview } from '../controllers/reviews.controller';
import { validate } from '../middleware/validate.middleware';
import { generalRateLimiter } from '../middleware/rateLimiter';
import { z } from 'zod';

const router = Router();

const SubmitReviewSchema = z.object({
  token: z.string().min(10),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10).max(1000),
  photoUrl: z.string().url().optional(),
});

router.get('/', getApproved);
router.post('/submit', generalRateLimiter, validate({ body: SubmitReviewSchema }), submitReview);

export default router;
