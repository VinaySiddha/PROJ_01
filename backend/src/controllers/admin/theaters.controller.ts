/**
 * @file Admin theaters controller — full CRUD for theater management
 * @module controllers/admin/theaters
 */
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../prisma/client';
import { sendSuccess, sendCreated, sendNoContent } from '../../utils/response';
import { NotFoundError } from '../../utils/errors';

/**
 * GET /api/admin/theaters
 * Returns all theaters (active and inactive) with their location name and slug,
 * ordered by location then sort order.
 *
 * @param req  - Express request
 * @param res  - Express response
 * @param next - Express next function for error forwarding
 * @returns    void — responds with an array of all theater records
 * @throws     AppError on database failure
 */
export async function listTheaters(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const theaters = await prisma.theater.findMany({
      include: { location: { select: { name: true, slug: true } } },
      orderBy: [{ location_id: 'asc' }, { sort_order: 'asc' }],
    });
    sendSuccess(res, theaters);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/theaters/:id
 * Returns a single theater by ID with its location and all configured time slots.
 *
 * @param req  - Express request; `req.params.id` is the theater UUID
 * @param res  - Express response
 * @param next - Express next function for error forwarding
 * @returns    void — responds with the full theater record including location and time slots
 * @throws     NotFoundError if no theater with the given ID exists
 */
export async function getTheaterDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const theater = await prisma.theater.findUnique({
      where: { id },
      include: {
        location: true,
        time_slots: { orderBy: { sort_order: 'asc' } },
      },
    });
    if (!theater) throw new NotFoundError('Theater', id);
    sendSuccess(res, theater);
  } catch (err) {
    next(err);
  }
}

/** Shape of the body expected when creating a new theater */
interface CreateTheaterBody {
  location_id: string;
  name: string;
  slug: string;
  screen_size: string;
  screen_resolution: string;
  sound_system: string;
  max_capacity: number;
  base_capacity: number;
  base_price: number;
  short_slot_price: number;
  extra_adult_price: number;
  extra_child_price: number;
  allow_extra_persons: boolean;
  couple_only: boolean;
  description: string;
  images: string[];
  youtube_url?: string;
  is_active: boolean;
  sort_order: number;
}

/**
 * POST /api/admin/theaters
 * Creates a new theater record with all pricing and capacity configuration.
 *
 * @param req  - Express request with a CreateTheaterBody-shaped JSON body
 * @param res  - Express response
 * @param next - Express next function for error forwarding
 * @returns    void — responds with 201 and the newly created theater record
 * @throws     AppError on database failure (e.g. unique constraint violation on slug)
 */
export async function createTheater(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = req.body as CreateTheaterBody;
    const theater = await prisma.theater.create({ data });
    sendCreated(res, theater);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/admin/theaters/:id
 * Replaces theater fields with the provided body. Supports partial updates.
 *
 * @param req  - Express request; `req.params.id` is the theater UUID; body contains fields to update
 * @param res  - Express response
 * @param next - Express next function for error forwarding
 * @returns    void — responds with the updated theater record
 * @throws     AppError if the theater does not exist (Prisma P2025) or database failure
 */
export async function updateTheater(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const theater = await prisma.theater.update({
      where: { id },
      data: req.body as Partial<CreateTheaterBody>,
    });
    sendSuccess(res, theater);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/admin/theaters/:id
 * Soft-deletes a theater by setting `is_active = false`.
 * The record is preserved in the database for historical booking integrity.
 *
 * @param req  - Express request; `req.params.id` is the theater UUID
 * @param res  - Express response
 * @param next - Express next function for error forwarding
 * @returns    void — responds with 204 No Content on success
 * @throws     AppError if the theater does not exist or database failure
 */
export async function deleteTheater(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    await prisma.theater.update({ where: { id }, data: { is_active: false } });
    sendNoContent(res);
  } catch (err) {
    next(err);
  }
}
