/**
 * hooks/useBooking.ts
 * Consolidated booking hook that exposes:
 *   - The Zustand booking wizard store (re-exported for convenience)
 *   - useBookingTotal — derives a PriceBreakdown from live data
 *   - useLockSlot     — mutation to reserve a slot before payment
 *   - useCreateBooking — mutation to confirm the booking after payment
 *   - useMyBookings   — fetches the authenticated customer's booking history
 */
'use client';

import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useBookingStore } from '@/store/bookingStore';
import type { CalculateTotalInput } from '@/store/bookingStore';
import type { Booking, PriceBreakdown } from '@/types/booking';
import type { ApiSuccessResponse, ApiPaginatedResponse } from '@/types/api';

// Re-export the store hook so components can import everything from one place
export { useBookingStore };

// ---------------------------------------------------------------------------
// Query key factory
// ---------------------------------------------------------------------------

const bookingKeys = {
  /** All booking-related queries */
  all: ['bookings'] as const,
  /** Current user's booking list */
  mine: ['bookings', 'mine'] as const,
  /** Single booking detail by ID */
  detail: (id: string) => ['bookings', 'detail', id] as const,
} as const;

// ---------------------------------------------------------------------------
// API request/response shapes
// ---------------------------------------------------------------------------

/** Body sent to POST /api/bookings/lock-slot */
interface LockSlotPayload {
  theater_id: string;
  slot_id: string;
  date: string;
}

/** Data returned from POST /api/bookings/lock-slot */
interface LockSlotResponseData {
  lock_id: string;
  /** Epoch milliseconds when the lock expires */
  expires_at: number;
}

/** Body sent to POST /api/bookings */
interface CreateBookingPayload {
  lock_id: string;
  theater_id: string;
  slot_id: string;
  date: string;
  duration_type: string;
  num_adults: number;
  num_children: number;
  occasion?: string;
  occasion_name?: string;
  cake_id?: string;
  addon_ids: string[];
  food_items: Array<{ food_item_id: string; quantity: number }>;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  coupon_code?: string;
  referral_code?: string;
}

// ---------------------------------------------------------------------------
// useBookingTotal
// ---------------------------------------------------------------------------

/**
 * Derives a memoized PriceBreakdown from the current wizard store state and
 * live pricing data passed in by the caller.
 *
 * Memoized on the CalculateTotalInput reference — recalculates only when
 * pricing data or the wizard state that affects the total changes.
 *
 * @param input - Live theater, addon, and cake pricing data
 * @returns PriceBreakdown object ready for the booking summary UI
 */
export const useBookingTotal = (input: CalculateTotalInput): PriceBreakdown => {
  // Pull the pure calculateTotal function from the store — does not trigger
  // re-renders because we are reading a function reference, not reactive state.
  const calculateTotal = useBookingStore((s) => s.calculateTotal);

  return useMemo(
    () => calculateTotal(input),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      // Spread the individual primitive fields of input so that the memo
      // only recomputes when an actual value changes, not on every render
      // (which would happen if we listed `input` as a dependency directly
      // since the caller likely creates a new object literal each render).
      input.theaterData.id,
      input.theaterData.base_price,
      input.theaterData.short_slot_price,
      input.theaterData.extra_adult_price,
      input.theaterData.extra_child_price,
      input.theaterData.allow_extra_persons,
      input.extraAdults,
      input.extraChildren,
      // Stringify maps/arrays so useMemo detects deep changes correctly
      JSON.stringify(input.addonPrices),
      input.cakePrice,
      input.couponDiscount,
      calculateTotal,
    ],
  );
};

// ---------------------------------------------------------------------------
// useLockSlot
// ---------------------------------------------------------------------------

/**
 * TanStack Mutation that calls POST /api/bookings/lock-slot to acquire a
 * short-lived Redis lock on the chosen slot before the user enters payment.
 *
 * On success the caller should store the `lock_id` from the response and
 * pass it to useCreateBooking so the backend can validate the lock.
 *
 * @returns TanStack MutationResult with data typed as LockSlotResponseData
 */
export const useLockSlot = () => {
  return useMutation({
    mutationFn: async (payload: LockSlotPayload): Promise<LockSlotResponseData> => {
      const res = await apiClient.post<ApiSuccessResponse<LockSlotResponseData>>(
        '/bookings/lock-slot',
        payload,
      );
      return res.data.data;
    },
  });
};

// ---------------------------------------------------------------------------
// useCreateBooking
// ---------------------------------------------------------------------------

/**
 * TanStack Mutation that submits the completed booking wizard to the backend.
 * Maps to POST /api/bookings.
 *
 * On success:
 *   - Invalidates the 'bookings/mine' query so the booking history refreshes
 *   - Returns the created Booking record for the confirmation screen
 */
export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateBookingPayload): Promise<Booking> => {
      const res = await apiClient.post<ApiSuccessResponse<Booking>>(
        '/bookings',
        payload,
      );
      return res.data.data;
    },
    onSuccess: async () => {
      // Invalidate the user's booking history so the list reflects the new entry
      await queryClient.invalidateQueries({ queryKey: bookingKeys.mine });
    },
  });
};

// ---------------------------------------------------------------------------
// useMyBookings
// ---------------------------------------------------------------------------

/**
 * Fetches the authenticated customer's booking history.
 * Maps to GET /api/my/bookings — requires a valid JWT in localStorage.
 *
 * Returns an empty array when the user is not logged in (no token present)
 * to avoid triggering an unnecessary 401 error on the bookings list page.
 *
 * @returns TanStack Query result with a Booking[] data array
 */
export const useMyBookings = () => {
  // Only fire the request if a token exists in localStorage; avoids a
  // wasteful 401 round-trip when the component mounts before auth state
  // has been determined.
  const hasToken =
    typeof window !== 'undefined' &&
    localStorage.getItem('themagicscreen_token') !== null;

  return useQuery({
    queryKey: bookingKeys.mine,
    queryFn:  async (): Promise<Booking[]> => {
      const res = await apiClient.get<ApiPaginatedResponse<Booking>>('/my/bookings');
      return res.data.data;
    },
    // Skip the request when not authenticated
    enabled: hasToken,
    // Bookings are user-specific and relatively volatile — use a shorter
    // stale time so the list feels up-to-date after confirming a booking.
    staleTime: 60_000, // 1 minute
  });
};
