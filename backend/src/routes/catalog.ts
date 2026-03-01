/**
 * @file Catalog routes — public addons, cakes, food categories
 * @module routes/catalog
 */
import { Router } from 'express';
import { getAddons, getCakes, getFoodCategories } from '../controllers/catalog.controller';

const router = Router();

router.get('/addons', getAddons);
router.get('/cakes', getCakes);
router.get('/food/categories', getFoodCategories);

export default router;
