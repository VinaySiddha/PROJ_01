/**
 * hooks/useTheaters.ts
 * TanStack Query hooks for fetching locations, theater lists, and single
 * theater details from the The Magic Screen API.
 *
 * Cache strategy:
 *   - staleTime: 5 minutes — these are relatively static resources; we don't
 *     want to refetch on every component mount.
 *   - gcTime (garbage collect): 10 minutes — keep data in memory while
 *     navigating between wizard steps so back-navigation is instant.
 */
'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type { Location, Theater } from '@/types/theater';
import type { ApiSuccessResponse, ApiPaginatedResponse } from '@/types/api';

// ---------------------------------------------------------------------------
// Query key factory
// Centralizes all query keys so invalidation is easy and consistent.
// ---------------------------------------------------------------------------

export const theaterKeys = {
  /** Root key — invalidate this to bust ALL theater-related queries */
  all:      ['theaters'] as const,
  /** Scoped to a particular location slug */
  list:     (locationSlug?: string) =>
    [...theaterKeys.all, 'list', locationSlug ?? 'all'] as const,
  /** A single theater by ID */
  detail:   (id: string) =>
    [...theaterKeys.all, 'detail', id] as const,
  /** All locations */
  locations: ['locations'] as const,
} as const;

// ---------------------------------------------------------------------------
// Shared stale time
// ---------------------------------------------------------------------------

/** 5 minutes in milliseconds */
const FIVE_MINUTES = 5 * 60 * 1_000;

/** 10 minutes in milliseconds */
const TEN_MINUTES = 10 * 60 * 1_000;

// ---------------------------------------------------------------------------
// useLocations
// ---------------------------------------------------------------------------

/**
 * Fetches all active locations.
 * Maps to GET /api/locations
 *
 * @returns TanStack Query result containing the locations array
 */
export const useLocations = () =>
  useQuery({
    queryKey: theaterKeys.locations,
    queryFn:  async (): Promise<Location[]> => {
      const res = await apiClient.get<ApiPaginatedResponse<Location>>('/locations');
      // The API wraps list results in { success, data: [], meta }
      return res.data.data;
    },
    staleTime: FIVE_MINUTES,
    gcTime:    TEN_MINUTES,
  });

// ---------------------------------------------------------------------------
// useTheaters
// ---------------------------------------------------------------------------

/**
 * Fetches the list of active theaters, optionally filtered by location slug.
 * Maps to GET /api/theaters?location=<slug>
 *
 * @param locationSlug - Optional location slug to filter results
 * @returns TanStack Query result containing the theaters array
 */
export const useTheaters = (locationSlug?: string) =>
  useQuery({
    queryKey: theaterKeys.list(locationSlug),
    queryFn:  async (): Promise<Theater[]> => {
      // Build query string only when a slug is provided
      const params = locationSlug ? { location: locationSlug } : undefined;
      const res = await apiClient.get<ApiPaginatedResponse<Theater>>('/theaters', { params });
      return res.data.data;
    },
    staleTime: FIVE_MINUTES,
    gcTime:    TEN_MINUTES,
  });

// ---------------------------------------------------------------------------
// useTheater
// ---------------------------------------------------------------------------

/**
 * Fetches a single theater by its database ID.
 * Maps to GET /api/theaters/:id
 *
 * The query is disabled when `id` is empty so that components can call this
 * hook unconditionally even before the theater ID is known.
 *
 * @param id - Theater database ID
 * @returns TanStack Query result containing the Theater record
 */
export const useTheater = (id: string) =>
  useQuery({
    queryKey: theaterKeys.detail(id),
    queryFn:  async (): Promise<Theater> => {
      const res = await apiClient.get<ApiSuccessResponse<Theater>>(`/theaters/${id}`);
      return res.data.data;
    },
    // Skip the fetch entirely when no ID is available yet
    enabled:   id.length > 0,
    staleTime: FIVE_MINUTES,
    gcTime:    TEN_MINUTES,
  });
