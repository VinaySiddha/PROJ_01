/**
 * @file Admin booking detail page — full booking info with status management
 * @module app/(admin)/admin/bookings/[id]/page
 */
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { formatDate, formatCurrency } from '../../../../../lib/formatters';
import {
  ChevronLeft,
  Loader2,
  Ban,
  CheckCircle,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { apiClient } from '../../../../../lib/api';
import type { Booking } from '../../../../../types/booking';
import Link from 'next/link';

const STATUS_COLORS: Record<string, string> = {
  confirmed:  'bg-green-500/15 text-green-400 border-green-500/30',
  completed:  'bg-blue-500/15 text-blue-400 border-blue-500/30',
  cancelled:  'bg-red-500/15 text-red-400 border-red-500/30',
  pending:    'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
};

export default function AdminBookingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [confirmText, setConfirmText] = useState('');

  const { data: booking, isLoading } = useQuery<Booking>({
    queryKey: ['admin', 'booking', params.id],
    queryFn: async () => {
      const res = await apiClient.get<{ data: Booking }>(`/admin/bookings/${params.id}`);
      return res.data.data;
    },
  });

  const statusMutation = useMutation({
    mutationFn: async (status: string) => {
      await apiClient.patch(`/admin/bookings/${params.id}/status`, { status });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'booking', params.id] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
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
        <Link href="/admin/bookings" className="mt-4 inline-block text-[#D4A017] hover:underline text-sm">
          Back to bookings
        </Link>
      </div>
    );
  }

  const isPending   = booking.status === 'pending';
  const isConfirmed = booking.status === 'confirmed';
  const isActive    = isPending || isConfirmed;

  return (
    <div className="max-w-2xl space-y-6">
      {/* Back + header */}
      <div>
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-[#888] hover:text-white transition-colors mb-4"
        >
          <ChevronLeft size={14} /> Back to bookings
        </button>
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
            Booking #{booking.booking_ref}
          </h1>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[booking.status] ?? 'bg-white/5 text-[#888] border-white/10'}`}>
            {booking.status.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* ── Status Actions ─────────────────────────────────────────── */}
      {isActive && (
        <div className={`p-4 rounded-2xl border ${isPending ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-[#D4A017]/20 bg-[#D4A017]/5'}`}>
          <p className="text-sm font-semibold text-white mb-3">
            {isPending ? '⏳ Payment Verification Needed' : '✅ Booking Confirmed'}
          </p>

          {isPending && (
            <>
              <p className="text-xs text-[#888] mb-3">
                Customer submitted UPI payment. UTR: <span className="font-mono text-white">{booking.payment_id ?? '—'}</span>
              </p>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => statusMutation.mutate('confirmed')}
                  disabled={statusMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition-colors disabled:opacity-60"
                >
                  {statusMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  Confirm Payment ✓
                </button>
                <button
                  type="button"
                  onClick={() => statusMutation.mutate('cancelled')}
                  disabled={statusMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/15 text-red-400 border border-red-500/30 text-sm hover:bg-red-500/25 transition-colors disabled:opacity-60"
                >
                  <Ban size={14} /> Reject &amp; Cancel
                </button>
              </div>
            </>
          )}

          {isConfirmed && (
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => statusMutation.mutate('completed')}
                disabled={statusMutation.isPending}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30 text-sm hover:bg-blue-500/25 transition-colors disabled:opacity-60"
              >
                {statusMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                Mark as Completed
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirmText !== booking.booking_ref) {
                    setConfirmText('confirm');
                    return;
                  }
                  statusMutation.mutate('cancelled');
                  setConfirmText('');
                }}
                disabled={statusMutation.isPending}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/15 text-red-400 border border-red-500/30 text-sm hover:bg-red-500/25 transition-colors disabled:opacity-60"
              >
                <Ban size={14} />
                {confirmText === 'confirm' ? 'Click again to confirm cancel' : 'Cancel Booking'}
              </button>
            </div>
          )}

          {statusMutation.isError && (
            <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
              <AlertCircle size={12} /> Failed to update status. Please try again.
            </p>
          )}
        </div>
      )}

      {/* Payment info for pending */}
      {isPending && booking.payment_id && (
        <div className="p-4 rounded-xl border border-white/10 bg-[#1A1A1A] flex items-start gap-3">
          <Clock size={16} className="text-yellow-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-white mb-1">UPI Payment Details</p>
            <p className="text-xs text-[#888]">Transaction Ref (UTR): <span className="font-mono text-white">{booking.payment_id}</span></p>
            <p className="text-xs text-[#888] mt-0.5">Gateway: {booking.payment_gateway ?? 'UPI'}</p>
          </div>
        </div>
      )}

      {/* Details grid */}
      <div className="grid grid-cols-1 gap-2">
        {[
          { label: 'Booking Ref',       value: booking.booking_ref },
          { label: 'Theater',           value: booking.theater.name },
          { label: 'Date',              value: formatDate(booking.date) },
          { label: 'Slot',              value: booking.slot.slot_name },
          { label: 'Duration',          value: booking.duration_type },
          { label: 'Occasion',          value: booking.occasion?.replace(/_/g, ' ') ?? '—' },
          { label: 'Occasion Name',     value: booking.occasion_name ?? '—' },
          { label: 'Adults',            value: String(booking.num_adults) },
          { label: 'Children',          value: String(booking.num_children) },
          { label: 'Total Amount',      value: formatCurrency(booking.total_amount) },
          { label: 'Advance Paid',      value: formatCurrency(booking.advance_paid) },
          { label: 'Balance Due',       value: formatCurrency(Math.max(0, booking.total_amount - booking.advance_paid)) },
          { label: 'Booked On',         value: formatDate(booking.created_at) },
        ].map((row) => (
          <div
            key={row.label}
            className="flex justify-between items-center px-4 py-3 rounded-xl border border-white/10 bg-[#1A1A1A]"
          >
            <span className="text-[#888] text-sm">{row.label}</span>
            <span className="text-white text-sm font-medium capitalize">{row.value}</span>
          </div>
        ))}
      </div>

      {/* Add-ons */}
      {booking.booking_addons.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-white mb-2">Add-Ons</h2>
          <div className="space-y-1.5">
            {booking.booking_addons.map((ba) => (
              <div key={ba.addon_id} className="flex justify-between items-center px-4 py-2.5 rounded-xl border border-white/10 bg-[#1A1A1A]">
                <span className="text-sm text-[#888]">{ba.addon.name}</span>
                <span className="text-sm text-white">{ba.quantity} × {formatCurrency(ba.unit_price)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Food items */}
      {booking.booking_food_items.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-white mb-2">Food Pre-Order</h2>
          <div className="space-y-1.5">
            {booking.booking_food_items.map((fi) => (
              <div key={fi.food_item_id} className="flex justify-between items-center px-4 py-2.5 rounded-xl border border-white/10 bg-[#1A1A1A]">
                <span className="text-sm text-[#888]">{fi.food_item.name}</span>
                <span className="text-sm text-white">{fi.quantity} × {formatCurrency(fi.unit_price)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
