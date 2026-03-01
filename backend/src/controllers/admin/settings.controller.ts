/**
 * @file Admin settings controller — read and bulk-upsert site-wide configuration settings
 * @module controllers/admin/settings
 */
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../prisma/client';
import { sendSuccess } from '../../utils/response';
import { AuditService } from '../../services/audit.service';

/**
 * GET /api/admin/settings
 * Returns all site settings as a flat key-value map for easy frontend consumption.
 * Settings are fetched from the site_settings table and ordered alphabetically by key.
 *
 * @param req  - Express request
 * @param res  - Express response
 * @param next - Express next function for error forwarding
 * @returns    void — responds with a `Record<string, string>` map of all setting keys and values
 * @throws     AppError on database failure
 */
export async function getSettings(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const settings = await prisma.siteSetting.findMany({ orderBy: { key: 'asc' } });
    // Convert array to key-value map for easier frontend consumption
    const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
    sendSuccess(res, map);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/admin/settings
 * Bulk-upserts one or more site settings in a single database transaction.
 * Existing settings are updated; new keys are created.
 * Writes a fire-and-forget audit log entry recording all changed keys and values.
 *
 * @param req  - Express request with a `{ key: string; value: string }[]` body
 * @param res  - Express response; `res.locals['userId']` must be set by authenticateAdmin middleware
 * @param next - Express next function for error forwarding
 * @returns    void — responds with 200 and null data after all upserts succeed
 * @throws     AppError on database failure (entire transaction is rolled back on error)
 */
export async function updateSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const updates = req.body as { key: string; value: string }[];
    const adminId = res.locals['userId'] as string;

    // Upsert every key-value pair atomically inside a single transaction
    await prisma.$transaction(
      updates.map(({ key, value }) =>
        prisma.siteSetting.upsert({
          where: { key },
          update: { value, updated_at: new Date() },
          create: { key, value },
        }),
      ),
    );

    // Fire-and-forget audit log — do not await
    AuditService.log({
      actorType: 'admin',
      actorId: adminId,
      action: 'settings.updated',
      category: 'settings',
      resourceType: 'settings',
      resourceId: 'site',
      metadata: Object.fromEntries(updates.map(({ key, value }) => [key, value])),
    });

    sendSuccess(res, null);
  } catch (err) {
    next(err);
  }
}
