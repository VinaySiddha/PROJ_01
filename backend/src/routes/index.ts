/**
 * @file Root router — mounts all sub-routers at /api/*
 * @module routes/index
 */
import { Router } from 'express';
import authRouter from './auth';
import theatersRouter from './theaters';
import bookingsRouter from './bookings';
import paymentsRouter from './payments';
import reviewsRouter from './reviews';
import adminRouter from './admin/index';
import catalogRouter from './catalog';
import { getLocations } from '../controllers/theaters.controller';
import { getSettings } from '../controllers/admin/settings.controller';

const router = Router();

router.use('/auth', authRouter);
router.use('/theaters', theatersRouter);
router.use('/bookings', bookingsRouter);
router.use('/payments', paymentsRouter);
router.use('/reviews', reviewsRouter);
router.use('/admin', adminRouter);
router.use('/', catalogRouter);

/** /api/locations — alias for /api/theaters/locations (frontend convenience) */
router.get('/locations', getLocations);

/** /api/settings — public read of site settings (UPI ID, contact details, etc.) */
router.get('/settings', getSettings);

/** Health check */
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
