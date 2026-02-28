/**
 * @file Admin theater routes
 * @module routes/admin/theaters
 */
import { Router } from 'express';
import { listTheaters, getTheaterDetail, createTheater, updateTheater, deleteTheater } from '../../controllers/admin/theaters.controller';

const router = Router();

router.get('/', listTheaters);
router.get('/:id', getTheaterDetail);
router.post('/', createTheater);
router.put('/:id', updateTheater);
router.delete('/:id', deleteTheater);

export default router;
