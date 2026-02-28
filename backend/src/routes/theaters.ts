/**
 * @file Theater routes — public theater listing
 * @module routes/theaters
 */
import { Router } from 'express';
import { getLocations, getAll, getOne, getSlots } from '../controllers/theaters.controller';
import { z } from 'zod';
import { validate } from '../middleware/validate.middleware';

const router = Router();

const SlotsQuerySchema = z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD') });

router.get('/locations', getLocations);
router.get('/', getAll);
router.get('/:id', getOne);
router.get('/:id/slots', validate({ query: SlotsQuerySchema }), getSlots);

export default router;
