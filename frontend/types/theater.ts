/**
 * types/theater.ts
 * Type definitions for locations, theaters, and time slots.
 */

export interface Location {
  id: string;
  name: string;
  slug: string;
  address: string;
  google_maps_url: string;
  google_maps_embed_url: string;
  latitude: number;
  longitude: number;
  google_rating: number;
  google_review_count: number;
  is_active: boolean;
}

export interface Theater {
  id: string;
  location_id: string;
  location?: Location;
  location_name?: string;     // Flat denormalized location name for listing cards
  name: string;
  slug: string;
  screen_size: string;
  screen_resolution: string;
  resolution?: string;        // Alias / short form used in TheaterSpecs
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
  images: string[];           // Array of Cloudinary URLs
  image_url?: string;         // Primary image URL shorthand used in TheaterCard
  youtube_url?: string;
  is_active: boolean;
  sort_order: number;
  average_rating?: number;    // Computed from reviews
  review_count?: number;      // Computed from reviews
}

export interface TimeSlot {
  id: string;
  theater_id: string;
  slot_name: string;          // e.g. 'Morning', 'Evening'
  start_time: string;         // e.g. '09:00'
  end_time: string;           // e.g. '12:00'
  is_active: boolean;
}

export interface SlotAvailability {
  slot_id: string;
  slot_name: string;
  start_time: string;
  end_time: string;
  is_available: boolean;      // false = already booked or locked
  is_locked: boolean;         // true = currently being booked by someone else
}
