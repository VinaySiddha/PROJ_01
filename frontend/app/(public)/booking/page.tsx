/**
 * @file Public booking status page — look up any booking by its Booking ID
 * @module app/(public)/booking/page
 */
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Loader2, CheckCircle2, Clock, XCircle, AlertCircle, MapPin, Calendar, Copy } from 'lucide-react';
import { apiClient } from '../../../lib/api';
import { formatDate } from '../../../lib/formatters';
import type { BookingStatus } from '../../../types/booking';

interface BookingLookupResult {
  booking_ref:    string;
  status:         BookingStatus;
  date:           string;
  theater_name:   string;
  location_name:  string;
  slot_name:      string;
  start_time:     string;
  end_time:       string;
  customer_name:  string | null;
  total_amount:   number;
  advance_paid:   number;
  occasion?:      string;
  occasion_name?: string;
  payment_id?:    string;
  created_at:     string;
}

const STATUS_CONFIG: Record<BookingStatus, { label: string; color: string; icon: React.ReactNode; bg: string }> = {
  pending:   { label: 'Pending Verification', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30', icon: <Clock size={20} className="text-yellow-400" /> },
  confirmed: { label: 'Confirmed',            color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/30',  icon: <CheckCircle2 size={20} className="text-green-400" /> },
  cancelled: { label: 'Cancelled',            color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/30',      icon: <XCircle size={20} className="text-red-400" /> },
  completed: { label: 'Completed',            color: 'text-[#888]',     bg: 'bg-white/5 border-white/10',           icon: <CheckCircle2 size={20} className="text-[#888]" /> },
};

function formatTime(time: string): string {
  try {
    const [h, m] = time.split(':');
    const hour = parseInt(h ?? '0', 10);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${m ?? '00'} ${suffix}`;
  } catch {
    return time;
  }
}

function BookingStatusContent() {
  const searchParams = useSearchParams();
  const [ref, setRef] = useState(searchParams.get('ref') ?? '');
  const [inputRef, setInputRef] = useState(searchParams.get('ref') ?? '');
  const [booking, setBooking] = useState<BookingLookupResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSearch = async (searchRef?: string) => {
    const lookupRef = (searchRef ?? ref).trim().toUpperCase();
    if (!lookupRef) return;

    setLoading(true);
    setError(null);
    setBooking(null);

    try {
      const res = await apiClient.get<{ data: BookingLookupResult }>(`/bookings/ref/${lookupRef}`);
      setBooking(res.data.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Booking not found.';
      setError(msg.includes('not found') || msg.includes('404') ? 'No booking found with that ID. Please check and try again.' : msg);
    } finally {
      setLoading(false);
    }
  };

  // Auto-search if ref is pre-filled from URL
  useEffect(() => {
    const urlRef = searchParams.get('ref');
    if (urlRef) {
      setRef(urlRef);
      setInputRef(urlRef);
      handleSearch(urlRef);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopy = async () => {
    if (!booking) return;
    try {
      await navigator.clipboard.writeText(booking.booking_ref);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {/* ignore */}
  };

  const statusConfig = booking ? STATUS_CONFIG[booking.status] : null;

  return (
    <div className="min-h-screen pt-28 pb-20 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1
            className="text-3xl font-bold text-white mb-2"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Track Your Booking
          </h1>
          <p className="text-[#888] text-sm">
            Enter your Booking ID to check the status of your reservation.
          </p>
        </div>

        {/* Search box */}
        <div className="flex gap-2 mb-8">
          <input
            type="text"
            value={inputRef}
            onChange={(e) => setInputRef(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setRef(inputRef);
                handleSearch(inputRef);
              }
            }}
            placeholder="e.g. TMS-XXXX-XXXX"
            className="flex-1 rounded-xl border border-white/10 bg-[#1A1A1A] px-4 py-3 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]/50 placeholder:text-[#444] placeholder:font-sans uppercase"
          />
          <button
            type="button"
            onClick={() => { setRef(inputRef); handleSearch(inputRef); }}
            disabled={loading || !inputRef.trim()}
            className="flex items-center gap-2 px-5 py-3 bg-[#D4A017] text-black font-bold rounded-xl hover:bg-[#D4A017]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Search size={18} />
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 mb-6">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {/* Result */}
        {booking && statusConfig && (
          <div className="rounded-2xl border border-white/10 bg-[#1A1A1A] overflow-hidden">
            {/* Status banner */}
            <div className={`flex items-center gap-3 px-5 py-4 border-b border-white/5 ${statusConfig.bg}`}>
              {statusConfig.icon}
              <div className="flex-1">
                <p className={`font-semibold ${statusConfig.color}`}>{statusConfig.label}</p>
                {booking.status === 'pending' && (
                  <p className="text-xs text-[#888] mt-0.5">We'll confirm after payment verification (usually within 30 min)</p>
                )}
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Booking ref */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#555] mb-0.5">Booking ID</p>
                  <p className="font-mono font-bold text-[#D4A017] text-lg">{booking.booking_ref}</p>
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-[#555] hover:text-white transition-colors"
                >
                  {copied ? <CheckCircle2 size={16} className="text-green-400" /> : <Copy size={16} />}
                </button>
              </div>

              <div className="h-px bg-white/5" />

              {/* Theater & location */}
              <div className="flex items-start gap-3">
                <MapPin size={15} className="text-[#D4A017] shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium">{booking.theater_name}</p>
                  <p className="text-sm text-[#666]">{booking.location_name}</p>
                </div>
              </div>

              {/* Date & slot */}
              <div className="flex items-start gap-3">
                <Calendar size={15} className="text-[#D4A017] shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium">{formatDate(booking.date)}</p>
                  <p className="text-sm text-[#666]">
                    {booking.slot_name} · {formatTime(booking.start_time)} – {formatTime(booking.end_time)}
                  </p>
                </div>
              </div>

              {/* Occasion */}
              {booking.occasion && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[#555]">Occasion</span>
                  <span className="text-sm text-white capitalize">
                    {booking.occasion.replace(/_/g, ' ')}
                    {booking.occasion_name ? ` · ${booking.occasion_name}` : ''}
                  </span>
                </div>
              )}

              <div className="h-px bg-white/5" />

              {/* Amount */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#666]">Total Amount</span>
                <span className="font-semibold text-white">
                  ₹{booking.total_amount?.toLocaleString('en-IN') ?? '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#666]">Advance Paid</span>
                <span className="text-sm text-green-400">
                  ₹{booking.advance_paid?.toLocaleString('en-IN') ?? '—'}
                </span>
              </div>
              {booking.payment_id && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#666]">UTR Reference</span>
                  <span className="text-sm font-mono text-[#888]">{booking.payment_id}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Help text */}
        {!booking && !loading && !error && (
          <div className="text-center text-[#555] text-sm mt-8">
            <p>Your Booking ID was shown after completing the booking.</p>
            <p className="mt-1">It looks like <span className="font-mono text-[#888]">TMS-XXXX-XXXX</span></p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookingStatusPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-28 flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-[#D4A017]" />
      </div>
    }>
      <BookingStatusContent />
    </Suspense>
  );
}
