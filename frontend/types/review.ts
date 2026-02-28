/**
 * types/review.ts
 * Type definitions for customer reviews and ratings.
 */

/** A single approved review */
export interface Review {
  id: string;
  theater_id: string;
  customer_name: string;
  rating: number;             // 1–5
  comment?: string;
  photo_url?: string;
  admin_reply?: string;
  created_at: string;
}

/** Aggregate rating summary for a theater */
export interface RatingSummary {
  average: number;
  count: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>; // Count per star level
}

/** Payload for submitting a new review */
export interface SubmitReviewPayload {
  token: string;              // One-time review token from WhatsApp link
  rating: number;
  comment?: string;
}
