/**
 * slots.service.ts
 * Handles slot availability checking and in-memory slot locking.
 * A slot is identified by the triplet: theater_id + date + slot_id.
 * Locks prevent double-booking during the payment window.
 */
import { prisma } from '../prisma/client';
import { redis } from '../redis/client';
import { logger } from '../utils/logger';
import { ConflictError, NotFoundError } from '../utils/errors';

/** TTL for a slot lock in seconds (10 minutes — enough for checkout) */
const SLOT_LOCK_TTL = 600;

/** Builds the lock key for a slot */
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
   */
  static async getAvailableSlots(theaterId: string, date: string): Promise<SlotAvailabilityResult[]> {
    const slots = await prisma.timeSlot.findMany({
      where: { theater_id: theaterId, is_active: true },
      orderBy: { start_time: 'asc' },
      select: { id: true, slot_name: true, start_time: true, end_time: true },
    });

    if (slots.length === 0) {
      throw new NotFoundError('Theater', theaterId);
    }

    const dayStart = new Date(date); dayStart.setHours(0, 0, 0, 0);
    const dayEnd   = new Date(date); dayEnd.setHours(23, 59, 59, 999);

    const confirmedBookings = await prisma.booking.findMany({
      where: {
        theater_id: theaterId,
        date: { gte: dayStart, lte: dayEnd },
        status: { in: ['pending', 'confirmed'] },
      },
      select: { slot_id: true },
    });

    const bookedSlotIds = new Set(confirmedBookings.map((b) => b.slot_id));

    const lockChecks = await Promise.all(
      slots.map((slot) => redis.get(slotLockKey(theaterId, date, slot.id))),
    );

    return slots.map((slot, index) => ({
      slot_id:      slot.id,
      slot_name:    slot.slot_name,
      start_time:   slot.start_time,
      end_time:     slot.end_time,
      is_available: !bookedSlotIds.has(slot.id) && !lockChecks[index],
      is_locked:    !!lockChecks[index],
    }));
  }

  /**
   * Locks a slot for 10 minutes to prevent double-booking during checkout.
   */
  static async lockSlot(
    theaterId: string,
    date: string,
    slotId: string,
    sessionId: string,
  ): Promise<void> {
    const key = slotLockKey(theaterId, date, slotId);

    const existingLock = await redis.get(key);
    if (existingLock) {
      throw new ConflictError(
        'BOOKING_SLOT_LOCKED',
        'This slot is currently being booked by someone else. Please try a different slot or check back in a few minutes.',
        'slot',
        slotId,
      );
    }

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

    await redis.setex(key, SLOT_LOCK_TTL, JSON.stringify({ sessionId, lockedAt: new Date().toISOString() }));
    logger.debug('Slot locked', { event: 'slot.locked', theaterId, date, slotId, sessionId });
  }

  /**
   * Releases a slot lock after payment succeeds or fails.
   */
  static async unlockSlot(theaterId: string, date: string, slotId: string): Promise<void> {
    await redis.del(slotLockKey(theaterId, date, slotId));
    logger.debug('Slot unlocked', { event: 'slot.unlocked', theaterId, date, slotId });
  }
}
