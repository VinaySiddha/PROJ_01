/**
 * @file Catalog controller — public addons, cakes, and food categories
 * @module controllers/catalog
 */
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';
import { sendSuccess } from '../utils/response';

/**
 * GET /api/addons
 * Returns all active add-ons ordered by category and sort_order.
 */
export async function getAddons(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const addons = await prisma.addon.findMany({
      where: { is_active: true },
      orderBy: [{ category: 'asc' }, { sort_order: 'asc' }],
    });
    sendSuccess(res, addons);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/cakes
 * Returns all active cakes ordered by sort_order.
 */
export async function getCakes(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cakes = await prisma.cake.findMany({
      where: { is_active: true },
      orderBy: { sort_order: 'asc' },
    });
    sendSuccess(res, cakes);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/food/categories
 * Returns all active food categories with their active items, ordered by sort_order.
 */
export async function getFoodCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const categories = await prisma.foodCategory.findMany({
      where: { is_active: true },
      orderBy: { sort_order: 'asc' },
      include: {
        food_items: {
          where: { is_available: true },
          orderBy: { sort_order: 'asc' },
        },
      },
    });
    sendSuccess(res, categories);
  } catch (err) {
    next(err);
  }
}
