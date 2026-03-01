/**
 * @file My Bookings page — customer booking history (requires auth)
 * @module app/(auth)/my-bookings/page
 */
'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '../../../store/authStore';
import { useMyBookings } from '../../../hooks/useBooking';
import { useAuth } from '../../../hooks/useAuth';
import { formatDate, formatCurrency } from '../../../lib/formatters';
import { CalendarCheck, LogOut, Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import type { Booking } from '../../../types/booking';

/** Booking status badge color mapping */
const STATUS_COLORS: Record<string, string> = {
  confirmed:     'bg-green-500/15 text-green-400 border-green-500/30',
  completed:     'bg-blue-500/15 text-blue-400 border-blue-500/30',
  cancelled:     'bg-red-500/15 text-red-400 border-red-500/30',
  pending:       'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
};

/**
 * Isolated component that reads the ?ref= param.
 * Must be wrapped in <Suspense> so Next.js 14 can statically analyse the page
 * without trying to access search params at build time.
 */
function BookingConfirmedBanner() {
  const searchParams = useSearchParams();
  const confirmedRef = searchParams.get('ref');

  if (!confirmedRef) return null;

  return (
    <div className="mb-6 p-4 rounded-xl border border-green-500/30 bg-green-500/10 flex items-center gap-3">
      <CheckCircle size={20} className="text-green-400 flex-shrink-0" />
      <div>
        <p className="text-sm font-medium text-green-400">Booking Confirmed!</p>
        <p className="text-xs text-green-400/70 mt-0.5">
          Reference: {confirmedRef}. You will receive a WhatsApp confirmation shortly.
        </p>
      </div>
    </div>
  );
}

export default function MyBookingsPage() {
  const router = useRouter();
  const { customer } = useAuthStore();
  const { logout } = useAuth();
  const { data: bookings, isLoading, error } = useMyBookings();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!customer) {
      router.push('/my-bookings/login');
    }
  }, [customer, router]);

  // Don't render anything until auth check is complete
  if (!customer) return null;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-[#0D0D0D]">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1
              className="text-3xl font-bold text-white"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              My Bookings
            </h1>
            <p className="text-[#888] text-sm mt-1">
              Welcome back, {customer.name || 'Guest'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-[#888] hover:text-red-400 hover:border-red-500/30 transition-all text-sm"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>

        {/* Payment success banner — Suspense required by Next.js 14 for useSearchParams */}
        <Suspense fallback={null}>
          <BookingConfirmedBanner />
        </Suspense>

        {/* Bookings list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-[#D4A017]" />
          </div>
        ) : error ? (
          <div className="text-center py-16 text-red-400">
            <p>Failed to load bookings. Please try again.</p>
          </div>
        ) : !bookings || bookings.length === 0 ? (
          <div className="text-center py-16">
            <CalendarCheck
              size={48}
              className="text-[#D4A017]/30 mx-auto mb-4"
            />
            <p className="text-[#888] mb-6">
              You haven't made any bookings yet.
            </p>
            <Link
              href="/theaters"
              className="px-6 py-3 bg-[#D4A017] text-black font-bold rounded-xl hover:bg-[#D4A017]/90 transition-all text-sm"
            >
              Browse Theaters
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking: Booking) => (
              <div
                key={booking.id}
                className="p-5 rounded-2xl border border-white/10 bg-[#1A1A1A] hover:border-[#D4A017]/30 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs text-[#D4A017] mb-1">
                      #{booking.booking_ref}
                    </p>
                    <p className="font-semibold text-white truncate">
                      {booking.theater.name}
                    </p>
                    <p className="text-sm text-[#888] mt-1">
                      {formatDate(booking.date)} &middot; {booking.slot.slot_name}
                    </p>
                    {booking.occasion && (
                      <p className="text-xs text-[#888] mt-0.5 capitalize">
                        {booking.occasion.replace(/_/g, ' ')}
                        {booking.occasion_name ? ` — ${booking.occasion_name}` : ''}
                      </p>
                    )}
                    <p className="text-xs text-[#888] mt-0.5">
                      {booking.num_adults} guest{booking.num_adults !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium border ${
                        STATUS_COLORS[booking.status] ??
                        'bg-white/5 text-[#888] border-white/10'
                      }`}
                    >
                      {booking.status.replace(/_/g, ' ')}
                    </span>
                    <p className="text-sm font-bold text-white mt-2">
                      {formatCurrency(booking.total_amount)}
                    </p>
                    <p className="text-xs text-[#888] mt-0.5">
                      Paid: {formatCurrency(booking.advance_paid)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
