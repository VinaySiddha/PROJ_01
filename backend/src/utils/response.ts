/**
 * utils/response.ts
 *
 * Standardized API response builder functions.
 * All controllers use these helpers — never build res.json() payloads manually.
 * Ensures every response follows the same { success, data } or { success, error } shape.
 */
import { Response } from 'express';

/**
 * Sends a successful JSON response with data.
 *
 * @param res    - Express response object
 * @param data   - The payload to send (object, array, or primitive)
 * @param status - HTTP status code (default: 200)
 */
export const sendSuccess = <T>(res: Response, data: T, status = 200): void => {
  res.status(status).json({ success: true, data });
};

/**
 * Sends a successful JSON response with data and pagination metadata.
 * Used for list endpoints that support page/limit query params.
 *
 * @param res   - Express response object
 * @param data  - Array of items for the current page
 * @param meta  - Pagination info: total count, current page, items per page
 */
export const sendPaginated = <T>(
  res: Response,
  data: T[],
  meta: { total: number; page: number; limit: number },
): void => {
  res.status(200).json({ success: true, data, meta });
};

/**
 * Sends a 201 Created response for newly created resources.
 *
 * @param res  - Express response object
 * @param data - The newly created resource
 */
export const sendCreated = <T>(res: Response, data: T): void => {
  res.status(201).json({ success: true, data });
};

/**
 * Sends a 204 No Content response for successful operations with no body.
 * Typically used for DELETE operations.
 *
 * @param res - Express response object
 */
export const sendNoContent = (res: Response): void => {
  res.status(204).send();
};
