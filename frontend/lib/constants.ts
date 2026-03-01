/**
 * lib/constants.ts
 * App-wide constants. Import from here — never hardcode these values inline.
 */
import type { OccasionType } from '@/types/booking';

/** API base URL from environment variable */
export const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api';

/** Advance payment amount collected at booking (in INR) */
export const ADVANCE_AMOUNT = 700;

/** Refundable portion of the advance (in INR) */
export const REFUNDABLE_AMOUNT = 500;

/** Non-refundable processing fee (in INR) */
export const PROCESSING_FEE = 200;

/** Cancellation window in hours — must cancel before this to get refund */
export const CANCELLATION_WINDOW_HOURS = 72;

/** Redis slot lock duration in minutes */
export const SLOT_LOCK_MINUTES = 10;

/** Time slot definitions — used in the slot picker UI */
export const TIME_SLOTS = [
  { name: 'Morning',   start: '09:00', end: '12:00', icon: '🌅' },
  { name: 'Afternoon', start: '12:00', end: '17:00', icon: '☀️' },
  { name: 'Evening',   start: '17:00', end: '21:00', icon: '🌆' },
  { name: 'Night',     start: '21:00', end: '01:00', icon: '🌙' },
] as const;

/** Duration options for slot booking */
export const DURATION_OPTIONS = [
  { value: 'standard', label: 'Standard (2.5 hrs)', description: 'Full experience' },
  { value: 'short',    label: 'Short (1.5 hrs)',    description: 'Quick celebration' },
] as const;

/** All supported celebration occasion types with display labels */
export const OCCASIONS: { value: OccasionType; label: string; emoji: string }[] = [
  { value: 'birthday',          label: 'Birthday Party',        emoji: '🎂' },
  { value: 'anniversary',       label: 'Anniversary',           emoji: '💍' },
  { value: 'bride_to_be',       label: 'Bride to Be',           emoji: '👰' },
  { value: 'mom_to_be',         label: 'Mom to Be',             emoji: '🤰' },
  { value: 'baby_shower',       label: 'Baby Shower',           emoji: '🍼' },
  { value: 'farewell',          label: 'Farewell',              emoji: '✈️' },
  { value: 'marriage_proposal', label: 'Marriage Proposal',     emoji: '💍' },
  { value: 'private_date',      label: 'Private Date / Movie Night', emoji: '🎬' },
  { value: 'reunion',           label: 'Reunion / Gathering',   emoji: '🎉' },
  { value: 'other',             label: 'Other',                 emoji: '⭐' },
];

/** Occasion-specific name prompts shown in the occasion step */
export const OCCASION_NAME_PROMPTS: Record<OccasionType, string> = {
  birthday:          "Birthday person's name",
  anniversary:       'Name for the couple',
  bride_to_be:       "Bride's name",
  mom_to_be:         "Mom's name",
  baby_shower:       "Mom's name",
  farewell:          "Person's name",
  marriage_proposal: "Partner's name",
  private_date:      'Your names (optional)',
  reunion:           'Group name (optional)',
  other:             'Name for personalization (optional)',
};

/** Maximum characters for occasion personalization name */
export const OCCASION_NAME_MAX_LENGTH = 20;

/** Booking wizard step count */
export const BOOKING_STEPS = 7;

/** WhatsApp contact link for customer support */
export const WHATSAPP_SUPPORT_LINK = 'https://wa.me/919999999999?text=Hi%20I%20need%20help%20with%20a%20The%20Magic%20Screen%20booking';
