/**
 * hooks/useSlotAvailability.ts
 * TanStack Query hook that polls slot availability for a given theater + date.
 *
 * Why polling?
 * Slot locks are held for 10 minutes (SLOT_LOCK_MINUTES). If another user
 * starts booking a slot while the current user is viewing the picker, the
 * availability must update without requiring a manual refresh.
 * A 30-second polling interval is a pragmatic balance between freshness
 * and server load for a low-traffic booking platform.
 */
'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type { SlotAvailability } from '@/types/theater';
import type { ApiSuccessResponse } from '@/types/api';

// ---------------------------------------------------------------------------
// Query key factory
// ---------------------------------------------------------------------------

export const slotKeys = {
  /** All slot-related queries */
  all:  ['slots'] as const,
  /**
   * Availability for a specific theater on a specific date.
   * Scoping by both ID and date ensures that changing the date triggers
   * a fresh fetch rather than returning stale data.
   */
  availability: (theaterId: string, date: string) =>
    [...slotKeys.all, 'availability', theaterId, date] as const,
} as const;

// ---------------------------------------------------------------------------
// API response shape
// ---------------------------------------------------------------------------

/** Raw response from GET /api/theaters/:id/slots?date=... */
type SlotsResponse = ApiSuccessResponse<SlotAvailability[]>;

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Fetches and polls slot availability for a theater on a given date.
 * Maps to GET /api/theaters/:id/slots?date=<YYYY-MM-DD>
 *
 * The query is disabled when either `theaterId` or `date` is absent so the
 * hook can be used unconditionally in Step 1 of the booking wizard before
 * the user has made selections.
 *
 * @param theaterId - Theater database ID (empty string to disable)
 * @param date      - ISO date string, e.g. '2026-03-15' (empty string to disable)
 *
 * @returns
 *   - `slots`     — Array of SlotAvailability (empty while loading)
 *   - `isLoading` — True during the initial fetch
 *   - `isError`   — True if the latest fetch failed
 *   - `error`     — The Error object if isError is true
 *   - `refetch`   — Manually trigger a refresh
 */
export const useSlotAvailability = (theaterId: string, date: string) => {
  const isEnabled = theaterId.length > 0 && date.length > 0;

  const query = useQuery({
    queryKey: slotKeys.availability(theaterId, date),
    queryFn:  async (): Promise<SlotAvailability[]> => {
      const res = await apiClient.get<SlotsResponse>(
        `/theaters/${theaterId}/slots`,
        { params: { date } },
      );
      return res.data.data;
    },
    enabled:         isEnabled,
    // Refetch every 30 seconds to reflect locks acquired by other users
    refetchInterval: 30_000,
    // Do NOT pause polling when the window loses focus — a user might have
    // the slot picker open in a background tab and still needs fresh data
    // when they return.
    refetchIntervalInBackground: false,
    // Keep stale data visible while a background refetch is in progress
    // so the UI never goes blank during the 30-second poll cycle.
    staleTime: 25_000,
  });

  return {
    /** Array of time slots with their current availability status */
    slots:     query.data ?? [],
    /** True during the initial fetch (no data yet) */
    isLoading: query.isLoading,
    /** True if the most recent fetch attempt threw an error */
    isError:   query.isError,
    /** The error from the last failed fetch, or null */
    error:     query.error,
    /** Imperatively trigger a re-fetch (e.g. after a failed lock attempt) */
    refetch:   query.refetch,
  } as const;
};
