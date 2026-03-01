/**
 * store/bookingStore.ts
 * Zustand booking wizard store.
 *
 * Persists to sessionStorage so that a page refresh during the multi-step
 * wizard does not lose the user's progress, but the state is automatically
 * cleared when the browser tab is closed.
 *
 * Slice layout follows the wizard steps:
 *   Step 0 → Location
 *   Step 1 → Theater & Slot
 *   Step 2 → Occasion
 *   Step 3 → Cake
 *   Step 4 → Add-ons
 *   Step 5 → Food pre-order
 *   Step 6 → Customer details + payment
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ADVANCE_AMOUNT } from '@/lib/constants';
import type { BookingWizardState, DurationType, OccasionType, PriceBreakdown } from '@/types/booking';
import type { Theater } from '@/types/theater';
import type { FoodOrderItem } from '@/types/addon';

// ---------------------------------------------------------------------------
// Location action — Step 0
// ---------------------------------------------------------------------------

interface SetLocationPayload {
  locationId: string;
  locationName: string;
}

// ---------------------------------------------------------------------------
// Theater + slot action — Step 1
// ---------------------------------------------------------------------------

interface SetTheaterPayload {
  theaterId: string;
  theaterName: string;
}

interface SetSlotPayload {
  slotId: string;
  slotName: string;
}

// ---------------------------------------------------------------------------
// Customer details action — Step 6
// ---------------------------------------------------------------------------

interface SetCustomerDetailsPayload {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
}

// ---------------------------------------------------------------------------
// calculateTotal helpers
// ---------------------------------------------------------------------------

/**
 * Input data required to compute the PriceBreakdown.
 * The calling component passes live data fetched from the API rather than
 * storing redundant pricing in the wizard state itself.
 */
export interface CalculateTotalInput {
  /** Full theater record (contains base_price, extra_adult_price, etc.) */
  theaterData: Theater;
  /** Number of adult guests above the base capacity */
  extraAdults: number;
  /** Number of child guests above the base capacity */
  extraChildren: number;
  /** Prices of each selected add-on, keyed by add-on ID */
  addonPrices: Record<string, number>;
  /** Price of the selected cake (0 if no cake selected) */
  cakePrice: number;
  /** Flat coupon discount amount in INR (0 if none applied) */
  couponDiscount: number;
}

// ---------------------------------------------------------------------------
// Store shape
// ---------------------------------------------------------------------------

/**
 * All state and actions available in the booking wizard store.
 * Separate the two with a union so persist() can serialize only the state.
 */
export interface BookingStore extends BookingWizardState {
  // ---- Step 0 ---------------------------------------------------------------
  /** Set the chosen location */
  setLocation: (payload: SetLocationPayload) => void;

  // ---- Step 1 ---------------------------------------------------------------
  /** Set the chosen theater */
  setTheater: (payload: SetTheaterPayload) => void;
  /** Set the booking date (ISO string, e.g. '2026-03-15') */
  setDate: (date: string) => void;
  /** Set the chosen time slot */
  setSlot: (payload: SetSlotPayload) => void;
  /** Set the duration type ('standard' | 'short') */
  setDuration: (duration: DurationType) => void;

  // ---- Step 2 ---------------------------------------------------------------
  /** Set the occasion and the personalization name */
  setOccasion: (occasion: OccasionType, occasionName: string) => void;

  // ---- Step 3 ---------------------------------------------------------------
  /** Set (or clear) the selected cake ID */
  setCake: (cakeId: string | null) => void;

  // ---- Step 4 ---------------------------------------------------------------
  /**
   * Toggle an add-on in/out of the selected set.
   * If the ID is already in addonIds it is removed; otherwise it is appended.
   */
  toggleAddon: (addonId: string) => void;

  // ---- Step 5 ---------------------------------------------------------------
  /**
   * Add a new food item, update the quantity of an existing one, or remove it
   * if the new quantity is 0.
   */
  setFoodItem: (item: FoodOrderItem) => void;

  // ---- Step 6 ---------------------------------------------------------------
  /** Update all customer contact details at once */
  setCustomerDetails: (payload: SetCustomerDetailsPayload) => void;
  /** Set or clear the coupon code string */
  setCouponCode: (code: string) => void;
  /** Set or clear the referral code string */
  setReferralCode: (code: string) => void;

  // ---- Derived / computed ---------------------------------------------------
  /**
   * Compute the full price breakdown from live theater + addon + cake data.
   * This is a pure function — it does NOT mutate store state.
   * Call it in the booking summary component to display the price to the user.
   */
  calculateTotal: (input: CalculateTotalInput) => PriceBreakdown;

  // ---- Reset ---------------------------------------------------------------
  /** Clear all booking wizard state back to the initial empty values */
  resetBooking: () => void;
}

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

/** Initial (empty) wizard state — also used by resetBooking */
const initialState: BookingWizardState = {
  // Step 0
  locationId:     null,
  locationName:   null,

  // Step 1
  theaterId:      null,
  theaterName:    null,
  date:           null,
  slotId:         null,
  slotName:       null,
  duration:       'standard', // Default to full-length slot

  // Step 2
  occasion:       null,
  occasionName:   '',

  // Step 3
  cakeId:         null,

  // Step 4
  addonIds:       [],

  // Step 5
  foodItems:      [],

  // Step 6
  customerName:   '',
  customerPhone:  '',
  customerEmail:  '',
  couponCode:     '',
  referralCode:   '',
};

// ---------------------------------------------------------------------------
// Store creation
// ---------------------------------------------------------------------------

export const useBookingStore = create<BookingStore>()(
  persist(
    (set, get) => ({
      // Spread the blank initial state so Zustand's persist layer merges
      // cleanly on hydration.
      ...initialState,

      // ---- Step 0 -----------------------------------------------------------
      setLocation: ({ locationId, locationName }) =>
        set({ locationId, locationName }),

      // ---- Step 1 -----------------------------------------------------------
      setTheater: ({ theaterId, theaterName }) =>
        set({ theaterId, theaterName }),

      setDate: (date) => set({ date }),

      setSlot: ({ slotId, slotName }) =>
        set({ slotId, slotName }),

      setDuration: (duration) => set({ duration }),

      // ---- Step 2 -----------------------------------------------------------
      setOccasion: (occasion, occasionName) =>
        set({ occasion, occasionName }),

      // ---- Step 3 -----------------------------------------------------------
      setCake: (cakeId) => set({ cakeId }),

      // ---- Step 4 -----------------------------------------------------------
      toggleAddon: (addonId) =>
        set((state) => {
          const exists = state.addonIds.includes(addonId);
          return {
            // Remove if present, append if absent
            addonIds: exists
              ? state.addonIds.filter((id) => id !== addonId)
              : [...state.addonIds, addonId],
          };
        }),

      // ---- Step 5 -----------------------------------------------------------
      setFoodItem: (item) =>
        set((state) => {
          // Composite key: same item in different sizes = separate cart entries
          const existing = state.foodItems.findIndex(
            (f) => f.food_item_id === item.food_item_id && f.variant_size === item.variant_size,
          );

          if (item.quantity === 0) {
            return {
              foodItems: state.foodItems.filter(
                (f) => !(f.food_item_id === item.food_item_id && f.variant_size === item.variant_size),
              ),
            };
          }

          if (existing !== -1) {
            const updated = [...state.foodItems];
            updated[existing] = item;
            return { foodItems: updated };
          }

          return { foodItems: [...state.foodItems, item] };
        }),

      // ---- Step 6 -----------------------------------------------------------
      setCustomerDetails: ({ customerName, customerPhone, customerEmail }) =>
        set({ customerName, customerPhone, customerEmail }),

      setCouponCode: (couponCode) => set({ couponCode }),

      setReferralCode: (referralCode) => set({ referralCode }),

      // ---- Derived -----------------------------------------------------------
      calculateTotal: ({ theaterData, extraAdults, extraChildren, addonPrices, cakePrice, couponDiscount }) => {
        const state = get();

        // Use the short-slot price when the customer chose a 1.5-hour slot
        const base_price =
          state.duration === 'short'
            ? theaterData.short_slot_price
            : theaterData.base_price;

        // Extra person charges only apply when the theater allows it
        const extra_persons_charge = theaterData.allow_extra_persons
          ? extraAdults * theaterData.extra_adult_price +
            extraChildren * theaterData.extra_child_price
          : 0;

        // Sum prices for all selected add-ons
        const addons_total = state.addonIds.reduce(
          (sum, id) => sum + (addonPrices[id] ?? 0),
          0,
        );

        // Sum the pre-ordered food items (quantity × unit price)
        const food_total = state.foodItems.reduce(
          (sum, fi) => sum + fi.quantity * fi.unit_price,
          0,
        );

        const subtotal =
          base_price + extra_persons_charge + addons_total + food_total + cakePrice;

        // Clamp discount so it can never exceed the subtotal (defensive guard)
        const safeDiscount = Math.min(couponDiscount, subtotal);

        const total = subtotal - safeDiscount;

        return {
          base_price,
          extra_persons_charge,
          addons_total,
          food_total,
          cake_price: cakePrice,
          coupon_discount: safeDiscount,
          total,
          advance_amount: ADVANCE_AMOUNT,
          // Balance due on arrival; floor at 0 in case advance > total
          balance_amount: Math.max(0, total - ADVANCE_AMOUNT),
        };
      },

      // ---- Reset -------------------------------------------------------------
      resetBooking: () => set(initialState),
    }),
    {
      name: 'themagicscreen-booking', // sessionStorage key
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
