/**
 * audit.service.ts
 *
 * Writes business-critical action records to the audit_logs DB table.
 * The table is append-only — rows are never updated or deleted.
 *
 * Rules:
 *   - All calls are fire-and-forget (no await from callers).
 *   - Audit logging failure must NEVER block or crash the business operation.
 *   - Never log sensitive data (OTPs, passwords, card numbers) in metadata.
 *
 * Approved action strings follow <resource>.<event> dot-notation.
 * Full reference: CODING_STANDARDS.md Section 17.6
 */
import { prisma } from '../prisma/client';
import { logger } from '../utils/logger';

/** Input shape for a single audit log entry */
export interface AuditEntry {
  actorType: 'customer' | 'admin' | 'system';
  actorId?: string;
  action: string;           // e.g. 'booking.created', 'theater.deleted'
  category: 'booking' | 'payment' | 'admin' | 'auth' | 'review' | 'coupon' | 'settings';
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditService {
  /**
   * Records an audit log entry in the database.
   * Fire-and-forget — the caller must NOT await this method.
   *
   * @param entry - The structured audit event to record
   */
  static log(entry: AuditEntry): void {
    // Run asynchronously without blocking the calling code
    prisma.auditLog
      .create({
        data: {
          actor_type:    entry.actorType,
          actor_id:      entry.actorId    ?? null,
          action:        entry.action,
          category:      entry.category,
          resource_type: entry.resourceType ?? null,
          resource_id:   entry.resourceId  ?? null,
          metadata:      (entry.metadata    ?? {}) as object,
          ip_address:    entry.ipAddress   ?? null,
          user_agent:    entry.userAgent   ?? null,
        },
      })
      .catch((error: Error) => {
        // DB failure is serious but must not crash the app — log to Winston only
        logger.error('AuditService: failed to write audit log to DB', {
          event:      'audit.db_write_failed',
          action:     entry.action,
          error:      error.message,
        });
      });
  }
}
