/**
 * auth.middleware.ts
 *
 * Customer JWT authentication middleware.
 * Verifies the Bearer token from the Authorization header.
 * On success, attaches customer ID and type to res.locals for downstream use.
 * On failure, calls next() with an UnauthorizedError (never throws directly).
 */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index';
import { UnauthorizedError } from '../utils/errors';

/** Shape of the JWT payload for customer tokens */
interface CustomerJwtPayload {
  sub: string;    // Customer ID (UUID)
  phone: string;  // Customer phone (masked in logs, never returned to client)
  type: 'customer';
}

/**
 * Verifies the customer JWT from the Authorization: Bearer <token> header.
 * Sets res.locals.userId and res.locals.userType on success.
 * Calls next(UnauthorizedError) on failure — never blocks with a thrown error.
 */
export const authenticateCustomer = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // Extract the Authorization header
  const authHeader = req.headers['authorization'];

  if (!authHeader?.startsWith('Bearer ')) {
    // No token provided — reject with 401
    next(new UnauthorizedError('AUTH_TOKEN_MISSING', 'Authentication required.'));
    return;
  }

  // Extract the token part after "Bearer "
  const token = authHeader.substring(7);

  try {
    // Verify signature and expiry; throws if invalid
    const payload = jwt.verify(token, config.JWT_SECRET) as CustomerJwtPayload;

    // Attach customer context to res.locals for use in controllers/services
    res.locals['userId'] = payload.sub;
    res.locals['userType'] = 'customer';

    next();
  } catch (err) {
    // Distinguish between expired and otherwise-invalid tokens
    if (err instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('AUTH_TOKEN_EXPIRED', 'Your session has expired. Please log in again.'));
    } else {
      next(new UnauthorizedError('AUTH_TOKEN_INVALID', 'Session is invalid. Please log in again.'));
    }
  }
};

/**
 * Optional authentication — attaches customer context if a valid token is present,
 * but does NOT reject the request if no token is provided.
 * Used for endpoints that work for both guests and logged-in customers.
 */
export const optionalAuthenticateCustomer = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers['authorization'];

  // If no token, just proceed as a guest
  if (!authHeader?.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = authHeader.substring(7);

  try {
    const payload = jwt.verify(token, config.JWT_SECRET) as CustomerJwtPayload;
    res.locals['userId'] = payload.sub;
    res.locals['userType'] = 'customer';
  } catch {
    // Invalid token on an optional auth endpoint — ignore and proceed as guest
  }

  next();
};
