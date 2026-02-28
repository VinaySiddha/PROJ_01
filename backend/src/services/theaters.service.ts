/**
 * theaters.service.ts
 * Business logic for fetching locations and theaters.
 * Results are shaped to include only the fields needed by the API response.
 */
import { prisma } from '../prisma/client';
import { NotFoundError } from '../utils/errors';

export class TheatersService {
  /**
   * Returns all active locations.
   */
  static async getAllLocations() {
    return prisma.location.findMany({
      where: { is_active: true },
      select: {
        id: true, name: true, slug: true, address: true,
        google_maps_url: true, google_maps_embed_url: true,
        latitude: true, longitude: true,
        google_rating: true, google_review_count: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Returns all active theaters, optionally filtered by location slug.
   * Includes aggregate review data (average rating and count).
   *
   * @param locationSlug - Optional location slug (e.g. 'hitec-city')
   */
  static async getAll(locationSlug?: string) {
    const locationFilter = locationSlug
      ? { location: { slug: locationSlug, is_active: true } }
      : {};

    const theaters = await prisma.theater.findMany({
      where: { is_active: true, ...locationFilter },
      select: {
        id: true, name: true, slug: true, screen_size: true,
        screen_resolution: true, sound_system: true,
        max_capacity: true, base_capacity: true,
        base_price: true, short_slot_price: true,
        extra_adult_price: true, extra_child_price: true,
        allow_extra_persons: true, couple_only: true,
        description: true, images: true, youtube_url: true,
        sort_order: true, location_id: true,
        location: { select: { id: true, name: true, slug: true } },
        // Include review aggregation
        reviews: {
          where: { is_approved: true },
          select: { rating: true },
        },
      },
      orderBy: { sort_order: 'asc' },
    });

    // Compute average rating and review count for each theater
    return theaters.map((theater) => {
      const ratings = theater.reviews.map((r) => r.rating);
      const averageRating = ratings.length > 0
        ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
        : null;

      // Exclude reviews array from response — only include aggregates
      const { reviews, ...theaterData } = theater;
      void reviews; // Used for computation above

      return { ...theaterData, average_rating: averageRating, review_count: ratings.length };
    });
  }

  /**
   * Returns a single theater by ID with full details including time slots.
   *
   * @param id - Theater UUID
   * @throws NotFoundError if theater does not exist or is inactive
   */
  static async getById(id: string) {
    const theater = await prisma.theater.findFirst({
      where: { id, is_active: true },
      include: {
        location: { select: { id: true, name: true, slug: true, address: true, google_maps_embed_url: true } },
        time_slots: { where: { is_active: true }, orderBy: { start_time: 'asc' } },
        reviews: {
          where: { is_approved: true },
          select: { id: true, customer_name: true, rating: true, comment: true, admin_reply: true, created_at: true },
          orderBy: { created_at: 'desc' },
          take: 10, // Return only the 10 most recent reviews on the detail page
        },
      },
    });

    if (!theater) throw new NotFoundError('Theater', id);

    // Compute aggregate rating
    const ratings = theater.reviews.map((r) => r.rating);
    const averageRating = ratings.length > 0
      ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
      : null;

    return { ...theater, average_rating: averageRating, review_count: ratings.length };
  }
}
