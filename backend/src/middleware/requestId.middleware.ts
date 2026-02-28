/**
 * requestId.middleware.ts
 *
 * Assigns a unique UUID to every incoming HTTP request.
 * The ID is stored in res.locals.requestId and echoed in the X-Request-ID response header.
 * All log entries within a request's lifecycle should include this ID for traceability.
 * Clients can include this ID in support queries to help locate specific requests in logs.
 */
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

/**
 * Middleware that attaches a request ID to every request.
 * Uses the client-provided X-Request-ID header if present (useful for frontend tracing),
 * otherwise generates a new UUID v4.
 */
export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // Use client-provided ID if present, otherwise generate a fresh UUID
  const requestId =
    (req.headers['x-request-id'] as string | undefined) ?? randomUUID();

  // Store in res.locals so all downstream middleware and controllers can access it
  res.locals['requestId'] = requestId;

  // Echo back in response header — client can quote this in support tickets
  res.setHeader('X-Request-ID', requestId);

  next();
};
