/**
 * @file Admin bookings controller — list, view, update status, and cancel bookings
 * @module controllers/admin/bookings
 */
import { Request, Response, NextFunction } from 'express';
import { BookingsService } from '../../services/bookings.service';
import { AuditService } from '../../services/audit.service';
import { sendSuccess, sendPaginated } from '../../utils/response';
import { prisma } from '../../prisma/client';

/**
 * GET /api/admin/bookings
 * Returns a paginated list of all bookings with optional filters.
 * Supports filtering by status, theaterId, date range, and full-text search on
 * customer name, phone, and booking reference.
 *
 * @param req  - Express request; optional query params: page, limit, status, search, theaterId, startDate, endDate
 * @param res  - Express response
 * @param next - Express next function for error forwarding
 * @returns    void — responds with a paginated list of bookings with customer, theater, and slot info
 * @throws     AppError on database failure
 */
export async function listBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      page = '1',
      limit = '20',
      status,
      search,
      theaterId,
      startDate,
      endDate,
    } = req.query as Record<string, string | undefined>;

    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);
    const skip = (parsedPage - 1) * parsedLimit;

    // Build a dynamic where clause from the query params
    const where: Record<string, unknown> = {};
    if (status) where['status'] = status;
    if (theaterId) where['theater_id'] = theaterId;
    if (startDate ?? endDate) {
      where['date'] = {
        ...(startDate ? { gte: new Date(startDate) } : {}),
        ...(endDate ? { lte: new Date(endDate) } : {}),
      };
    }
    if (search) {
      where['OR'] = [
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { phone: { contains: search } } },
        { booking_ref: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: parsedLimit,
        orderBy: { created_at: 'desc' },
        include: {
          customer: { select: { name: true, phone: true } },
          theater: { select: { name: true } },
          slot: { select: { slot_name: true, start_time: true } },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    sendPaginated(res, bookings, { page: parsedPage, limit: parsedLimit, total });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/bookings/:id
 * Returns full details of a single booking by ID without customer ownership validation.
 *
 * @param req  - Express request; `req.params.id` is the booking UUID
 * @param res  - Express response
 * @param next - Express next function for error forwarding
 * @returns    void — responds with the full booking detail object including add-ons, cake, and food items
 * @throws     NotFoundError if the booking does not exist
 */
export async function getBookingDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    // No customerId passed — admin can view any booking
    const booking = await BookingsService.getBooking(id);
    sendSuccess(res, booking);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/bookings/:id/status
 * Updates the status of a booking and optionally attaches an admin note.
 * Writes a fire-and-forget audit log entry for the action.
 *
 * @param req  - Express request; `req.params.id` is the booking UUID; body: `{ status, adminNote? }`
 * @param res  - Express response; `res.locals['userId']` must be set by authenticateAdmin middleware
 * @param next - Express next function for error forwarding
 * @returns    void — responds with the updated booking record
 * @throws     AppError if the booking does not exist or database update fails
 */
export async function updateBookingStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const { status, adminNote } = req.body as { status: string; adminNote?: string };
    const adminId = res.locals['userId'] as string;

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: status as never },
    });

    // Fire-and-forget audit log — do not await
    AuditService.log({
      actorType: 'admin',
      actorId: adminId,
      action: 'booking.status_updated',
      category: 'booking',
      resourceType: 'booking',
      resourceId: id,
      metadata: { status, adminNote },
    });

    sendSuccess(res, updated);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/bookings/:id/cancel
 * Cancels a booking on behalf of an admin, bypassing customer ownership validation.
 * Releases the slot lock and sends a WhatsApp cancellation notice.
 *
 * @param req  - Express request; `req.params.id` is the booking UUID
 * @param res  - Express response
 * @param next - Express next function for error forwarding
 * @returns    void — responds with `{ refundAmount, booking }` on success
 * @throws     NotFoundError if the booking does not exist
 * @throws     ConflictError if the booking is already cancelled
 */
export async function adminCancelBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    // No customerId — admin cancellation skips ownership check
    const result = await BookingsService.cancelBooking(id, { cancelledBy: 'admin' });
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}
