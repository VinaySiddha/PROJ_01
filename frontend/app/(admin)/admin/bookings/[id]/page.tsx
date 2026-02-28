/**
 * @file Admin booking detail page — full booking info and status display
 * @module app/(admin)/admin/bookings/[id]/page
 */
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { formatDate, formatCurrency } from '../../../../../lib/formatters';
import { ChevronLeft, Loader2, Ban, CheckCircle } from 'lucide-react';
import { apiClient } from '../../../../../lib/api';
import type { Booking } from '../../../../../types/booking';
import Link from 'next/link';

/** Status badge color map */
const STATUS_COLORS: Record<string, string> = {
  confirmed: 'bg-green-500/15 text-green-400',
  completed: 'bg-blue-500/15 text-blue-400',
  cancelled: 'bg-red-500/15 text-red-400',
  pending:   'bg-yellow-500/15 text-yellow-400',
};

export default function AdminBookingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: booking, isLoading } = useQuery<Booking>({
    queryKey: ['admin', 'booking', params.id],
    queryFn: async () => {
      const res = await apiClient.get<{ data: Booking }>(
        `/admin/bookings/${params.id}`,
      );
      return res.data.data;
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post(`/admin/bookings/${params.id}/cancel`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['admin', 'booking', params.id],
      });
    },
  });

  const completeMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post(`/admin/bookings/${params.id}/complete`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['admin', 'booking', params.id],
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={24} className="animate-spin text-[#D4A017]" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-16 text-[#888]">
        <p>Booking not found.</p>
        <Link
          href="/admin/bookings"
          className="mt-4 inline-block text-[#D4A017] hover:underline text-sm"
        >
          Back to bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Back link */}
      <div>
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-[#888] hover:text-white transition-colors mb-4"
        >
          <ChevronLeft size={14} /> Back to bookings
        </button>
        <div className="flex items-center justify-between">
          <h1
            className="text-2xl font-bold text-white"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Booking #{booking.booking_ref}
          </h1>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              STATUS_COLORS[booking.status] ?? 'bg-white/5 text-[#888]'
            }`}
          >
            {booking.status.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-1 gap-3">
        {[
          { label: 'Booking Ref',    value: booking.booking_ref },
          { label: 'Theater',        value: booking.theater.name },
          { label: 'Location',       value: booking.theater.location?.name ?? '—' },
          { label: 'Date',           value: formatDate(booking.date) },
          { label: 'Slot',           value: booking.slot.slot_name },
          { label: 'Duration',       value: booking.duration_type },
          { label: 'Occasion',       value: booking.occasion?.replace(/_/g, ' ') ?? '—' },
          { label: 'Occasion Name',  value: booking.occasion_name ?? '—' },
          { label: 'Guests (Adults)',value: String(booking.num_adults) },
          { label: 'Guests (Children)',value: String(booking.num_children) },
          { label: 'Total Amount',   value: formatCurrency(booking.total_amount) },
          { label: 'Advance Paid',   value: formatCurrency(booking.advance_paid) },
          { label: 'Balance Due',    value: formatCurrency(booking.total_amount - booking.advance_paid) },
          { label: 'Coupon Code',    value: booking.coupon_code ?? '—' },
          { label: 'Payment Gateway',value: booking.payment_gateway ?? '—' },
          { label: 'Booked On',      value: formatDate(booking.created_at) },
        ].map((row) => (
          <div
            key={row.label}
            className="flex justify-between items-center p-4 rounded-xl border border-white/10 bg-[#1A1A1A]"
          >
            <span className="text-[#888] text-sm">{row.label}</span>
            <span className="text-white text-sm font-medium capitalize">
              {row.value}
            </span>
          </div>
        ))}
      </div>

      {/* Add-ons */}
      {booking.booking_addons.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-white mb-2">Add-Ons</h2>
          <div className="space-y-2">
            {booking.booking_addons.map((ba) => (
              <div
                key={ba.addon_id}
                className="flex justify-between items-center px-4 py-2.5 rounded-xl border border-white/10 bg-[#1A1A1A]"
              >
                <span className="text-sm text-[#888]">{ba.addon.name}</span>
                <span className="text-sm text-white font-medium">
                  {ba.quantity} × {formatCurrency(ba.unit_price)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Food items */}
      {booking.booking_food_items.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-white mb-2">Food Pre-Order</h2>
          <div className="space-y-2">
            {booking.booking_food_items.map((fi) => (
              <div
                key={fi.food_item_id}
                className="flex justify-between items-center px-4 py-2.5 rounded-xl border border-white/10 bg-[#1A1A1A]"
              >
                <span className="text-sm text-[#888]">{fi.food_item.name}</span>
                <span className="text-sm text-white font-medium">
                  {fi.quantity} × {formatCurrency(fi.unit_price)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        {booking.status === 'confirmed' && (
          <>
            <button
              type="button"
              onClick={() => completeMutation.mutate()}
              disabled={completeMutation.isPending}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500/15 text-green-400 text-sm hover:bg-green-500/25 transition-colors disabled:opacity-60"
            >
              {completeMutation.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <CheckCircle size={14} />
              )}
              Mark as Completed
            </button>
            <button
              type="button"
              onClick={() => cancelMutation.mutate()}
              disabled={cancelMutation.isPending}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/15 text-red-400 text-sm hover:bg-red-500/25 transition-colors disabled:opacity-60"
            >
              {cancelMutation.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Ban size={14} />
              )}
              Cancel Booking
            </button>
          </>
        )}
      </div>
    </div>
  );
}
