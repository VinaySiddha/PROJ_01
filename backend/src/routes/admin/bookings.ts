/**
 * @file Admin booking routes
 * @module routes/admin/bookings
 */
import { Router } from 'express';
import { listBookings, getBookingDetail, updateBookingStatus, adminCancelBooking } from '../../controllers/admin/bookings.controller';

const router = Router();

router.get('/', listBookings);
router.get('/:id', getBookingDetail);
router.patch('/:id/status', updateBookingStatus);
router.post('/:id/cancel', adminCancelBooking);

export default router;
