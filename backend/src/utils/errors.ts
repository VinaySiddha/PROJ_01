/**
 * utils/errors.ts
 *
 * Application error class hierarchy.
 * All intentional errors thrown by services must use one of these classes.
 *
 * Rules:
 *   - The error `code` MUST match a row in the error_master DB table.
 *   - If adding a new error code, add the seed row to error_master first.
 *   - Never throw plain `new Error()` from business logic — always use a subclass here.
 */

/**
 * Base class for all known application errors.
 * Carries HTTP status, machine-readable code, severity, and optional resource context.
 * The global error handler reads these fields to respond correctly and log to DB.
 */
export class AppError extends Error {
  constructor(
    public readonly message: string,       // User-facing error message
    public readonly statusCode: number,    // HTTP response status code
    public readonly code: string,          // Must match error_master.code
    public readonly severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    public readonly resourceType?: string, // Which entity type was affected (e.g. 'booking')
    public readonly resourceId?: string,   // ID of the affected entity
    public readonly metadata?: Record<string, unknown>, // Extra context for error log
  ) {
    super(message);
    this.name = 'AppError';
    // Restore prototype chain — required when extending built-in Error in TypeScript
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * 404 — The requested resource does not exist or is inactive.
 * Automatically builds the error code from the resource name.
 *
 * @param resource   - Human-readable resource name, e.g. 'Theater', 'Booking'
 * @param resourceId - Optional ID of the missing resource for log context
 */
export class NotFoundError extends AppError {
  constructor(resource: string, resourceId?: string) {
    // Builds code like 'THEATER_NOT_FOUND' from 'Theater'
    const code = `${resource.toUpperCase().replace(/\s+/g, '_')}_NOT_FOUND`;
    super(`${resource} not found.`, 404, code, 'low', resource.toLowerCase(), resourceId);
  }
}

/**
 * 409 — A conflict prevents the operation from completing.
 * Used for: slot already locked, duplicate slugs, already-cancelled bookings.
 *
 * @param code         - Must match error_master.code (e.g. 'BOOKING_SLOT_LOCKED')
 * @param message      - User-facing message describing the conflict
 * @param resourceType - Which entity type caused the conflict
 * @param resourceId   - ID of the conflicting resource
 */
export class ConflictError extends AppError {
  constructor(
    code: string,
    message: string,
    resourceType?: string,
    resourceId?: string,
  ) {
    super(message, 409, code, 'medium', resourceType, resourceId);
  }
}

/**
 * 400 — A business rule or input validation constraint was violated.
 * Used for: capacity exceeded, coupon expired, cancellation window closed.
 *
 * @param code    - Must match error_master.code (e.g. 'BOOKING_CAPACITY_EXCEEDED')
 * @param message - User-facing message describing the violation
 */
export class ValidationError extends AppError {
  constructor(code: string, message: string) {
    super(message, 400, code, 'low');
  }
}

/**
 * 401 — Request lacks valid authentication credentials.
 * Used when a JWT is missing, expired, or invalid.
 *
 * @param code - Defaults to AUTH_TOKEN_INVALID; override for specific auth errors
 */
export class UnauthorizedError extends AppError {
  constructor(code = 'AUTH_TOKEN_INVALID', message = 'Authentication required.') {
    super(message, 401, code, 'low');
  }
}

/**
 * 403 — Authenticated but not authorized to perform this action.
 * Used when an admin with insufficient role attempts a restricted endpoint.
 *
 * @param code - Defaults to AUTH_INSUFFICIENT_ROLE
 */
export class ForbiddenError extends AppError {
  constructor(code = 'AUTH_INSUFFICIENT_ROLE') {
    super('You do not have permission to perform this action.', 403, code, 'medium');
  }
}

/**
 * 429 — Too many requests. Rate limit hit.
 *
 * @param code    - Defaults to RATE_LIMIT_EXCEEDED
 * @param message - User-facing message
 */
export class RateLimitError extends AppError {
  constructor(
    code = 'RATE_LIMIT_EXCEEDED',
    message = 'Too many requests. Please slow down.',
  ) {
    super(message, 429, code, 'medium');
  }
}

/**
 * 502 — An external service (payment gateway, WhatsApp, Cloudinary) failed.
 * The operation could not complete due to a third-party error.
 *
 * @param code     - Must match error_master.code (e.g. 'PAYMENT_ORDER_FAILED')
 * @param message  - User-facing message
 * @param metadata - Extra context (gateway response, attempt details)
 */
export class ExternalServiceError extends AppError {
  constructor(
    code: string,
    message: string,
    metadata?: Record<string, unknown>,
  ) {
    super(message, 502, code, 'high', undefined, undefined, metadata);
  }
}
