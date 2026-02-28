/**
 * @file BookingsTable — paginated data table for admin bookings management
 * @module components/admin/BookingsTable
 */
'use client';

import { formatCurrency, formatDate } from '@/lib/formatters';
import { Eye, Ban, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import type { Booking, BookingStatus } from '@/types/booking';

/** Status badge color map */
const STATUS_COLORS: Record<BookingStatus, string> = {
  confirmed: 'bg-green-500/15 text-green-400 border-green-500/30',
  pending: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
  completed: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
};

/** Props for BookingsTable */
interface BookingsTableProps {
  /** Array of booking records */
  bookings: Booking[];
  /** Total count for pagination */
  total: number;
  /** Current page number */
  page: number;
  /** Items per page */
  limit: number;
  /** Called when page changes */
  onPageChange: (page: number) => void;
  /** Whether data is loading */
  isLoading?: boolean;
}

/**
 * BookingsTable — renders bookings in a table with status badges, pagination,
 * and links to individual booking detail pages.
 *
 * @param props - BookingsTableProps
 * @returns A paginated table of booking records with status badges and action controls
 */
export default function BookingsTable({
  bookings,
  total,
  page,
  limit,
  onPageChange,
  isLoading = false,
}: BookingsTableProps) {
  const totalPages = Math.ceil(total / limit);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-14 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-card/50">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Booking Ref
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Theater
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Date &amp; Slot
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Occasion
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  No bookings found
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-xs text-accent">
                    {booking.booking_ref}
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-foreground">{booking.theater.name}</p>
                      {booking.theater.location && (
                        <p className="text-xs text-muted-foreground">
                          {booking.theater.location.name}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-foreground">{formatDate(booking.date)}</p>
                      <p className="text-xs text-muted-foreground">{booking.slot.slot_name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">
                    {booking.occasion
                      ? booking.occasion.replace(/_/g, ' ')
                      : <span className="text-foreground-subtle">—</span>}
                  </td>
                  <td className="px-4 py-3 text-foreground font-medium">
                    {formatCurrency(booking.total_amount)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        STATUS_COLORS[booking.status] ??
                        'bg-white/5 text-muted-foreground border-border'
                      }`}
                    >
                      {booking.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/bookings/${booking.id}`}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                        title="View details"
                      >
                        <Eye size={14} />
                      </Link>
                      {booking.status === 'confirmed' && (
                        <button
                          type="button"
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/5 transition-colors"
                          title="Cancel booking"
                        >
                          <Ban size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} bookings
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                  p === page
                    ? 'bg-accent text-black'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
