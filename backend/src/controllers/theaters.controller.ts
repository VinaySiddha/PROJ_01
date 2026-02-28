/**
 * @file Theaters controller — public theater listing and slot availability
 * @module controllers/theaters
 */
import { Request, Response, NextFunction } from 'express';
import { TheatersService } from '../services/theaters.service';
import { SlotsService } from '../services/slots.service';
import { sendSuccess } from '../utils/response';

/**
 * GET /api/theaters/locations
 * Returns all active locations.
 *
 * @param req  - Express request
 * @param res  - Express response
 * @param next - Express next function for error forwarding
 * @returns    void — responds with an array of location objects
 * @throws     AppError on database failure
 */
export async function getLocations(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const locations = await TheatersService.getAllLocations();
    sendSuccess(res, locations);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/theaters?location=hitec-city
 * Returns all active theaters, optionally filtered by location slug.
 *
 * @param req  - Express request; optional `location` query param for filtering
 * @param res  - Express response
 * @param next - Express next function for error forwarding
 * @returns    void — responds with an array of theater objects with aggregate ratings
 * @throws     AppError on database failure
 */
export async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const locationSlug = req.query['location'] as string | undefined;
    const theaters = await TheatersService.getAll(locationSlug);
    sendSuccess(res, theaters);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/theaters/:id
 * Returns a single theater by ID with full details including time slots and recent reviews.
 *
 * @param req  - Express request; `req.params.id` is the theater UUID
 * @param res  - Express response
 * @param next - Express next function for error forwarding
 * @returns    void — responds with a theater object
 * @throws     NotFoundError if the theater does not exist or is inactive
 */
export async function getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const theater = await TheatersService.getById(id);
    sendSuccess(res, theater);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/theaters/:id/slots?date=YYYY-MM-DD
 * Returns all active time slots for a theater on a given date, with availability status.
 *
 * @param req  - Express request; `req.params.id` is the theater UUID, `req.query.date` is ISO date string
 * @param res  - Express response
 * @param next - Express next function for error forwarding
 * @returns    void — responds with an array of SlotAvailabilityResult objects
 * @throws     NotFoundError if the theater has no active slots
 */
export async function getSlots(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const { date } = req.query as { date: string };
    const slots = await SlotsService.getAvailableSlots(id, date);
    sendSuccess(res, slots);
  } catch (err) {
    next(err);
  }
}
