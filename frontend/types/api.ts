/**
 * types/api.ts
 * Shared API request/response type definitions used across the frontend.
 * These mirror the backend's standardized response shape.
 */

/** Standard success response wrapper from the API */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

/** Paginated success response from list endpoints */
export interface ApiPaginatedResponse<T> {
  success: true;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

/** Error response from the API */
export interface ApiErrorResponse {
  success: false;
  requestId?: string;
  error: {
    code: string;
    message: string;
    errors?: Record<string, string>; // Field-level validation errors
  };
}

/** Union type for any API response */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
