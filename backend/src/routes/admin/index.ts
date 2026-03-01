/**
 * @file Admin router — mounts all admin sub-routes under /api/admin
 * @module routes/admin
 */
import { Router } from 'express';
import { authenticateAdmin } from '../../middleware/admin.middleware';
import bookingsRouter from './bookings';
import theatersRouter from './theaters';
import reviewsRouter from './reviews';
import couponsRouter from './coupons';
import errorLogsRouter from './errorLogs';
import settingsRouter from './settings';
import { getStats, getUpcomingBookings } from '../../controllers/admin/dashboard.controller';
import uploadRouter from './upload';

const router = Router();

// All admin routes require authentication
router.use(authenticateAdmin);

// Dashboard endpoints
router.get('/dashboard/stats', getStats);
router.get('/dashboard/upcoming', getUpcomingBookings);

// Sub-routers
router.use('/bookings', bookingsRouter);
router.use('/theaters', theatersRouter);
router.use('/reviews', reviewsRouter);
router.use('/coupons', couponsRouter);
router.use('/error-logs', errorLogsRouter);
router.use('/settings', settingsRouter);
router.use('/upload', uploadRouter);

export default router;
