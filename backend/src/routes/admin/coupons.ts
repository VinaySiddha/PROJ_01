/**
 * @file Admin coupon routes
 * @module routes/admin/coupons
 */
import { Router } from 'express';
import { listCoupons, createCoupon, disableCoupon } from '../../controllers/admin/coupons.controller';

const router = Router();

router.get('/', listCoupons);
router.post('/', createCoupon);
router.post('/:id/disable', disableCoupon);

export default router;
