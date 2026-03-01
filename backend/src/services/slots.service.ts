/**
 * slots.service.ts
 * Handles slot availability checking and Redis-based slot locking.
 * A slot is identified by the triplet: theater_id + date + slot_id.
 * Locks prevent double-booking during the payment window.
 */
import { prisma } from '../prisma/client';
import { redis } from '../redis/client';
import { logger } from '../utils/logger';
import { ConflictError, NotFoundError } from '../utils/errors';

/** TTL for a slot lock in seconds (10 minutes — enough for checkout) */
const SLOT_LOCK_TTL = 600;

/** Builds the Redis key for a slot lock */
const slotLockKey = (theaterId: string, date: string, slotId: string): string =>
  `lock:${theaterId}:${date}:${slotId}`;

/** Shape returned by getAvailableSlots */
export interface SlotAvailabilityResult {
  slot_id: string;
  slot_name: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  is_locked: boolean;
}

export class SlotsService {
  /**
   * Returns all active time slots for a theater on a given date,
   * with availability and lock status for each slot.
   *
   * @param theaterId - Theater UUID
   * @param date      - ISO date string (e.g. '2026-03-15')
   */
  static async getAvailableSlots(theaterId: string, date: string): Promise<SlotAvailabilityResult[]> {
    // Fetch all active time slots configured for this theater
    const slots = await prisma.timeSlot.findMany({
      where: { theater_id: theaterId, is_active: true },
      orderBy: { start_time: 'asc' },
      select: { id: true, slot_name: true, start_time: true, end_time: true },
    });

    if (slots.length === 0) {
      throw new NotFoundError('Theater', theaterId);
    }

    // Parse the date for the start/end of the day for the DB query
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    // Get all confirmed bookings for this theater on this date
    const confirmedBookings = await prisma.booking.findMany({
      where: {
        theater_id: theaterId,
        date: { gte: dayStart, lte: dayEnd },
        status: { in: ['pending', 'confirmed'] },
      },
      select: { slot_id: true },
    });

    // Build a Set of booked slot IDs for O(1) lookup
    const bookedSlotIds = new Set(confirmedBookings.map((b) => b.slot_id));

    // Check Redis lock status — degrade gracefully if Redis is unavailable
    let lockChecks: (string | null)[];
    try {
      lockChecks = await Promise.all(
        slots.map((slot) => redis.get(slotLockKey(theaterId, date, slot.id))),
      );
    } catch (redisErr) {
      logger.warn('Redis unavailable for slot lock check, treating all slots as unlocked', {
        error: (redisErr as Error).message,
      });
      lockChecks = slots.map(() => null);
    }

    return slots.map((slot, index) => ({
      slot_id:      slot.id,
      slot_name:    slot.slot_name,
      start_time:   slot.start_time,
      end_time:     slot.end_time,
      is_available: !bookedSlotIds.has(slot.id) && !lockChecks[index],
      is_locked:    !!lockChecks[index],              // Locked = mid-booking by another user
    }));
  }

  /**
   * Locks a slot for 10 minutes to prevent double-booking during checkout.
   * Throws ConflictError if already locked or booked.
   *
   * @param theaterId - Theater UUID
   * @param date      - ISO date string
   * @param slotId    - TimeSlot UUID
   * @param sessionId - Unique identifier for the booking session (stored in lock value)
   */
  static async lockSlot(
    theaterId: string,
    date: string,
    slotId: string,
    sessionId: string,
  ): Promise<void> {
    const key = slotLockKey(theaterId, date, slotId);

    // Check for existing Redis lock (skip if Redis unavailable)
    try {
      const existingLock = await redis.get(key);
      if (existingLock) {
        throw new ConflictError(
          'BOOKING_SLOT_LOCKED',
          'This slot is currently being booked by someone else. Please try a different slot or check back in a few minutes.',
          'slot',
          slotId,
        );
      }
    } catch (err) {
      // Re-throw ConflictError; swallow Redis connection errors
      if ((err as { name?: string }).name === 'ConflictError' || (err as { code?: string }).code?.startsWith('BOOKING_')) throw err;
      logger.warn('Redis unavailable for lock check, proceeding without lock', { error: (err as Error).message });
    }

    // Check for confirmed DB booking (handles edge case where lock expired but booking exists)
    const dayStart = new Date(date); dayStart.setHours(0, 0, 0, 0);
    const dayEnd   = new Date(date); dayEnd.setHours(23, 59, 59, 999);

    const existingBooking = await prisma.booking.findFirst({
      where: {
        theater_id: theaterId,
        slot_id:    slotId,
        date:       { gte: dayStart, lte: dayEnd },
        status:     { in: ['pending', 'confirmed'] },
      },
    });

    if (existingBooking) {
      throw new ConflictError('BOOKING_SLOT_UNAVAILABLE', 'This slot is no longer available.', 'slot', slotId);
    }

    // Lock the slot with a 10-minute TTL (best-effort — skip if Redis unavailable)
    try {
      await redis.setex(key, SLOT_LOCK_TTL, JSON.stringify({ sessionId, lockedAt: new Date().toISOString() }));
      logger.debug('Slot locked', { event: 'slot.locked', theaterId, date, slotId, sessionId });
    } catch (redisErr) {
      logger.warn('Redis unavailable, slot locked in DB only', { error: (redisErr as Error).message });
    }
  }

  /**
   * Releases a slot lock. Called after payment succeeds or fails.
   *
   * @param theaterId - Theater UUID
   * @param date      - ISO date string
   * @param slotId    - TimeSlot UUID
   */
  static async unlockSlot(theaterId: string, date: string, slotId: string): Promise<void> {
    const key = slotLockKey(theaterId, date, slotId);
    try {
      await redis.del(key);
      logger.debug('Slot unlocked', { event: 'slot.unlocked', theaterId, date, slotId });
    } catch (redisErr) {
      logger.warn('Redis unavailable, could not remove slot lock', { error: (redisErr as Error).message });
    }
  }
}
