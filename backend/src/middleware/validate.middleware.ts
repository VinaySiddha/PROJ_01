/**
 * validate.middleware.ts
 *
 * Zod request validation middleware factory.
 * Validates req.body, req.query, and req.params against a Zod schema.
 * Returns a 400 VALIDATION_FAILED response immediately if validation fails.
 * Replaces the request fields with the parsed (coerced) Zod output on success.
 */
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/** Defines which parts of the request to validate */
interface ValidationTargets {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

/**
 * Factory function returning a middleware that validates request data against Zod schemas.
 * Replaces the original request data with Zod's parsed output (enables type coercion).
 * Sends a 400 response with field-level error details if validation fails.
 *
 * @param schemas - Object specifying which request parts to validate and their schemas
 *
 * @example
 *   router.post('/', validate({ body: CreateBookingSchema }), createBooking);
 */
export const validate = (schemas: ValidationTargets) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validate and replace each request part that has a schema
      if (schemas.body) {
        // Parse replaces req.body with Zod's output (coercion applied, defaults filled)
        req.body = schemas.body.parse(req.body) as unknown;
      }

      if (schemas.query) {
        // Cast needed because Express types query as ParsedQs — Zod normalizes it
        req.query = schemas.query.parse(req.query) as typeof req.query;
      }

      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as typeof req.params;
      }

      next();
    } catch (err) {
      if (err instanceof ZodError) {
        // Format Zod errors into a flat, client-friendly errors object
        const errors = err.errors.reduce<Record<string, string>>((acc, issue) => {
          const field = issue.path.join('.');
          acc[field] = issue.message;
          return acc;
        }, {});

        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Invalid request data.',
            errors, // Field-level error messages for frontend to display
          },
        });
        return;
      }

      // Non-Zod error — pass to global error handler
      next(err);
    }
  };
};
