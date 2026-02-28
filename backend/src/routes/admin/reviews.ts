/**
 * @file Admin review routes
 * @module routes/admin/reviews
 */
import { Router } from 'express';
import { listReviews, approveReview, rejectReview } from '../../controllers/admin/reviews.controller';

const router = Router();

router.get('/', listReviews);
router.post('/:id/approve', approveReview);
router.post('/:id/reject', rejectReview);

export default router;
