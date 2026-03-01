/**
 * types/booking.ts
 * Type definitions for the booking wizard state, booking records, and related entities.
 */
import type { Theater, TimeSlot } from './theater';
import type { AddonItem, CakeItem } from './addon';
import type { FoodOrderItem } from './addon';

/** All supported occasion/celebration types */
export type OccasionType =
  | 'birthday'
  | 'anniversary'
  | 'bride_to_be'
  | 'mom_to_be'
  | 'baby_shower'
  | 'farewell'
  | 'marriage_proposal'
  | 'proposal'
  | 'private_date'
  | 'date_night'
  | 'movie_night'
  | 'reunion'
  | 'other';

/** Duration type for a slot booking */
export type DurationType = 'standard' | 'short';

/** Availability status of a time slot for a given date */
export type SlotStatus = 'available' | 'booked' | 'locked';

/** A time slot with its real-time availability for a chosen date */
export interface SlotAvailabilityResult {
  slot_id: string;
  name: string;
  time_range: string;
  status: SlotStatus;
}

/** Status of a booking throughout its lifecycle */
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

/** The in-progress state managed by the booking wizard (Zustand store) */
export interface BookingWizardState {
  // Step 0 — Location
  locationId: string | null;
  locationName: string | null;

  // Step 1 — Theater & Slot
  theaterId: string | null;
  theaterName: string | null;
  date: string | null;          // ISO date string, e.g. '2026-03-15'
  slotId: string | null;
  slotName: string | null;
  duration: DurationType;

  // Step 2 — Occasion
  occasion: OccasionType | null;
  occasionName: string;         // Personalization name, e.g. birthday person's name

  // Step 3 — Cake (optional)
  cakeId: string | null;

  // Step 4 — Add-ons (optional, multi-select)
  addonIds: string[];

  // Step 5 — Food pre-order (optional)
  foodItems: FoodOrderItem[];

  // Step 6 — Customer details
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  couponCode: string;
  referralCode: string;
}

/** A completed booking record returned from the API */
export interface Booking {
  id: string;
  booking_ref: string;
  theater: Theater;
  date: string;
  slot: TimeSlot;
  duration_type: DurationType;
  num_adults: number;
  num_children: number;
  occasion?: string;
  occasion_name?: string;
  status: BookingStatus;
  base_amount: number;
  addons_amount: number;
  food_amount: number;
  cake_amount: number;
  total_amount: number;
  advance_paid: number;
  coupon_code?: string;
  payment_gateway?: string;
  created_at: string;
  booking_addons: BookingAddonItem[];
  booking_food_items: FoodOrderItem[];
  cake?: CakeItem;
}

/** A single add-on attached to a booking */
export interface BookingAddonItem {
  addon_id: string;
  addon: AddonItem;
  quantity: number;
  unit_price: number;
}

/** Price breakdown for the booking summary page */
export interface PriceBreakdown {
  base_price: number;
  extra_persons_charge: number;
  extra_adults?: number;
  extra_children?: number;
  addons_total: number;
  food_total: number;
  cake_price: number;
  coupon_discount: number;
  coupon_code?: string;
  total: number;
  advance_amount: number;        // Amount charged now (Rs 700)
  balance_amount: number;        // Remaining to pay on arrival
}
