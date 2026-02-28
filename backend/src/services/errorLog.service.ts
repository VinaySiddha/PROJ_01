/**
 * errorLog.service.ts
 *
 * Persists error occurrences to the error_logs DB table for permanent history.
 * Called exclusively by the global errorHandler middleware — not by business code.
 *
 * Rules:
 *   - Fire-and-forget — never blocks the error response.
 *   - If DB write fails, falls back to Winston only — never throws.
 *   - Strips sensitive fields from request body before storing (via sanitizeObject).
 */
import { prisma } from '../prisma/client';
import { logger } from '../utils/logger';
import { sanitizeObject } from '../utils/formatters';

/** Input shape passed from the global error handler */
export interface ErrorLogEntry {
  errorCode:      string;
  severity:       string;
  message:        string;
  stackTrace?:    string;
  requestId?:     string;
  requestPath?:   string;
  requestMethod?: string;
  requestBody?:   Record<string, unknown>;
  actorType?:     string;
  actorId?:       string;
  ipAddress?:     string;
  resourceType?:  string;
  resourceId?:    string;
  metadata?:      Record<string, unknown>;
}

export class ErrorLogService {
  /**
   * Writes an error occurrence to the error_logs table.
   * Fire-and-forget — callers must NOT await this method.
   *
   * @param entry - Structured error context from the global error handler
   */
  static log(entry: ErrorLogEntry): void {
    // Sanitize request body before persisting — removes passwords, OTPs, tokens, card data
    const sanitizedBody = entry.requestBody
      ? sanitizeObject(entry.requestBody)
      : undefined;

    prisma.errorLog
      .create({
        data: {
          error_code:     entry.errorCode,
          severity:       entry.severity,
          message:        entry.message,
          stack_trace:    entry.stackTrace    ?? null,
          request_id:     entry.requestId     ?? null,
          request_path:   entry.requestPath   ?? null,
          request_method: entry.requestMethod ?? null,
          request_body:   sanitizedBody       ?? {},
          actor_type:     entry.actorType     ?? null,
          actor_id:       entry.actorId       ?? null,
          ip_address:     entry.ipAddress     ?? null,
          resource_type:  entry.resourceType  ?? null,
          resource_id:    entry.resourceId    ?? null,
          metadata:       entry.metadata      ?? {},
        },
      })
      .catch((dbError: Error) => {
        // Last resort — write to Winston so we at least have a log trail
        logger.error('ErrorLogService: failed to persist error log to DB', {
          event:        'error_log.db_write_failed',
          originalCode: entry.errorCode,
          dbError:      dbError.message,
        });
      });
  }
}
