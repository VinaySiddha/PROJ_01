/**
 * admin.middleware.ts
 *
 * Admin JWT authentication and role authorization middleware.
 * Used on all /api/admin/* routes to ensure only authenticated admins can proceed.
 * Role hierarchy: super_admin > manager > staff
 */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';

/** Supported admin roles, ordered from lowest to highest privilege */
export type AdminRole = 'staff' | 'manager' | 'super_admin';

/** Shape of the JWT payload for admin tokens */
interface AdminJwtPayload {
  sub: string;       // Admin ID (UUID)
  email: string;     // Admin email
  role: AdminRole;   // Admin role
  type: 'admin';
}

/**
 * Verifies the admin JWT and attaches admin context to res.locals.
 * Rejects with 401 if no token or invalid token.
 * Must be applied before any role-specific middleware.
 */
export const authenticateAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers['authorization'];

  if (!authHeader?.startsWith('Bearer ')) {
    next(new UnauthorizedError('AUTH_TOKEN_MISSING', 'Authentication required.'));
    return;
  }

  const token = authHeader.substring(7);

  try {
    const payload = jwt.verify(token, config.JWT_SECRET) as AdminJwtPayload;

    // Verify this is actually an admin token (not a customer token)
    if (payload.type !== 'admin') {
      next(new UnauthorizedError('AUTH_TOKEN_INVALID', 'Invalid token type.'));
      return;
    }

    // Attach admin context for downstream use in controllers and audit logging
    res.locals['userId'] = payload.sub;
    res.locals['userEmail'] = payload.email;
    res.locals['userRole'] = payload.role;
    res.locals['userType'] = 'admin';

    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('AUTH_TOKEN_EXPIRED', 'Your session has expired. Please log in again.'));
    } else {
      next(new UnauthorizedError('AUTH_TOKEN_INVALID', 'Session is invalid. Please log in again.'));
    }
  }
};

/**
 * Returns a middleware that enforces a minimum role requirement.
 * Call after authenticateAdmin in the middleware chain.
 *
 * Role privilege order: staff < manager < super_admin
 * Passing 'manager' means manager and super_admin are allowed; staff is rejected.
 *
 * @param minimumRole - The minimum role level required to proceed
 *
 * @example
 *   router.delete('/:id', authenticateAdmin, requireRole('super_admin'), deleteTheater);
 */
export const requireRole = (minimumRole: AdminRole) => {
  // Role privilege levels — higher index = more privilege
  const ROLE_LEVELS: Record<AdminRole, number> = {
    staff: 0,
    manager: 1,
    super_admin: 2,
  };

  return (_req: Request, res: Response, next: NextFunction): void => {
    const adminRole = res.locals['userRole'] as AdminRole | undefined;

    if (!adminRole) {
      // This middleware must always run after authenticateAdmin
      next(new UnauthorizedError());
      return;
    }

    const adminLevel = ROLE_LEVELS[adminRole] ?? -1;
    const requiredLevel = ROLE_LEVELS[minimumRole];

    if (adminLevel < requiredLevel) {
      // Admin is authenticated but doesn't have sufficient role
      next(new ForbiddenError('AUTH_INSUFFICIENT_ROLE'));
      return;
    }

    next();
  };
};
