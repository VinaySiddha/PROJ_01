/**
 * @file Admin error logs controller — view and filter application error log entries
 * @module controllers/admin/errorLogs
 */
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../prisma/client';
import { sendPaginated } from '../../utils/response';

/**
 * GET /api/admin/error-logs
 * Returns a paginated list of error log entries, optionally filtered by error code and date range.
 * Includes the linked error master record for severity and category context.
 *
 * @param req  - Express request; optional query params: page, limit, errorCode, startDate, endDate
 * @param res  - Express response
 * @param next - Express next function for error forwarding
 * @returns    void — responds with a paginated list of error log entries
 * @throws     AppError on database failure
 */
export async function listErrorLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      page = '1',
      limit = '20',
      errorCode,
      startDate,
      endDate,
    } = req.query as Record<string, string | undefined>;

    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);
    const skip = (parsedPage - 1) * parsedLimit;

    const where: Record<string, unknown> = {};
    if (errorCode) where['error_code'] = errorCode;
    if (startDate ?? endDate) {
      where['created_at'] = {
        ...(startDate ? { gte: new Date(startDate) } : {}),
        ...(endDate ? { lte: new Date(endDate) } : {}),
      };
    }

    const [logs, total] = await Promise.all([
      prisma.errorLog.findMany({
        where,
        skip,
        take: parsedLimit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.errorLog.count({ where }),
    ]);

    sendPaginated(res, logs, { page: parsedPage, limit: parsedLimit, total });
  } catch (err) {
    next(err);
  }
}
