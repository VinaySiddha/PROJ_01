/**
 * errorHandler.ts
 *
 * Global Express error handling middleware — the final middleware in the chain.
 * Every error thrown or passed via next(error) anywhere in the app arrives here.
 *
 * Responsibilities (executed in order):
 *   1. Resolve error code and HTTP status from the error type
 *   2. Log to Winston immediately (synchronous — guaranteed before response)
 *   3. Persist to error_logs DB via ErrorLogService (async, fire-and-forget)
 *   4. Send standardized JSON error response to the client
 *
 * This handler NEVER throws. Any internal failure is swallowed after Winston logging.
 */
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { sanitizeObject } from '../utils/formatters';

// Lazy import to avoid circular dependency at module load time
// ErrorLogService imports prisma, which may not be ready during initial load
let errorLogServiceLoaded = false;
let ErrorLogService: { log: (entry: Record<string, unknown>) => void } | null = null;

const getErrorLogService = async () => {
  if (!errorLogServiceLoaded) {
    try {
      const module = await import('../services/errorLog.service');
      ErrorLogService = module.ErrorLogService;
    } catch {
      // If service fails to load, log to Winston only — never crash the error handler
    }
    errorLogServiceLoaded = true;
  }
  return ErrorLogService;
};

/**
 * Global error handler middleware.
 * Must be registered as the LAST middleware in app.ts using app.use(errorHandler).
 * The 4-parameter signature is required for Express to treat it as an error middleware.
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void => {
  // ── Step 1: Resolve error properties ────────────────────────────────────
  const isAppError = error instanceof AppError;
  const errorCode  = isAppError ? error.code       : 'INTERNAL_ERROR';
  const statusCode = isAppError ? error.statusCode : 500;
  const severity   = isAppError ? error.severity   : 'critical';

  const requestId = res.locals['requestId'] as string | undefined;

  // ── Step 2: Log to Winston synchronously ───────────────────────────────
  // This always runs first so we have a log trail even if DB write fails
  logger.error(error.message, {
    event:      'unhandled_error',
    errorCode,
    severity,
    requestId,
    path:       req.path,
    method:     req.method,
    actorType:  res.locals['userType'] as string | undefined,
    actorId:    res.locals['userId'] as string | undefined,
    stack:      error.stack,
  });

  // ── Step 3: Persist to error_logs table (fire-and-forget) ──────────────
  // Wrapped in void to explicitly signal we're not awaiting
  void getErrorLogService().then((service) => {
    if (!service) return; // Service unavailable — Winston log is sufficient

    service.log({
      errorCode,
      severity,
      message:        error.message,
      stackTrace:     error.stack,
      requestId,
      requestPath:    req.path,
      requestMethod:  req.method,
      // Sanitize request body before storing — strips passwords, OTPs, tokens
      requestBody:    req.body ? sanitizeObject(req.body as Record<string, unknown>) : undefined,
      actorType:      res.locals['userType'] as string | undefined,
      actorId:        res.locals['userId'] as string | undefined,
      ipAddress:      req.ip,
      resourceType:   isAppError ? error.resourceType : undefined,
      resourceId:     isAppError ? error.resourceId   : undefined,
      metadata:       isAppError ? error.metadata     : undefined,
    });
  });

  // ── Step 4: Send response to client ────────────────────────────────────
  // Never expose stack traces or internal messages in production
  res.status(statusCode).json({
    success:   false,
    requestId, // Client includes this in support tickets to trace the exact error
    error: {
      code:    errorCode,
      message: isAppError
        ? error.message
        : 'Something went wrong on our end. Please try again.',
    },
  });
};
