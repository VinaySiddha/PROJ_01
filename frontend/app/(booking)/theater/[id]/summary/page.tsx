/**
 * @file Booking wizard Step 7 — final summary and UPI payment
 * @module app/(booking)/theater/[id]/summary/page
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useBookingStore } from '../../../../../store/bookingStore';
import { BookingStepIndicator } from '../../../../../components/booking/BookingStepIndicator';
import { BookingSummaryCard } from '../../../../../components/booking/BookingSummaryCard';
import {
  ChevronLeft,
  Loader2,
  Copy,
  CheckCircle2,
  Smartphone,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../../../../lib/formatters';
import { ADVANCE_AMOUNT } from '../../../../../lib/constants';
import { apiClient } from '../../../../../lib/api';
import type { Theater } from '../../../../../types/theater';
import type { AddonItem, CakeItem } from '../../../../../types/addon';

const BOOKING_STEPS = ['Date & Slot', 'Occasion', 'Cake', 'Add-Ons', 'Food', 'Details', 'Summary'];

type Step = 'summary' | 'payment' | 'success';

// eslint-disable-next-line sonarjs/cognitive-complexity
export default function SummaryPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const store = useBookingStore();

  const [step, setStep] = useState<Step>('summary');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UPI payment state
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [bookingRef, setBookingRef] = useState<string | null>(null);
  const [upiId, setUpiId] = useState<string>('');
  const [utr, setUtr] = useState('');
  const [copied, setCopied] = useState(false);

  // Live data for price calculation
  const [theater, setTheater] = useState<Theater | null>(null);
  const [addons, setAddons] = useState<AddonItem[]>([]);
  const [cake, setCake] = useState<CakeItem | null>(null);

  useEffect(() => {
    apiClient
      .get<{ data: Theater }>(`/theaters/${params.id}`)
      .then((res) => setTheater(res.data.data))
      .catch(() => {/* Non-critical */});
    apiClient
      .get<{ data: AddonItem[] }>('/addons')
      .then((res) => setAddons(res.data.data ?? []))
      .catch(() => {/* Non-critical */});
    if (store.cakeId) {
      apiClient
        .get<{ data: CakeItem }>(`/cakes/${store.cakeId}`)
        .then((res) => setCake(res.data.data))
        .catch(() => {/* Non-critical */});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, store.cakeId]);

  /** Creates the booking and moves to payment panel */
  const handleCreateBooking = async () => {
    if (!store.theaterId || !store.slotId || !store.date) {
      setError('Your booking session is incomplete. Please select date and slot again.');
      return;
    }

    if (!store.customerName.trim()) {
      setError('Please enter your name in the details step.');
      return;
    }

    const rawPhone = store.customerPhone.trim();
    const digitsOnly = rawPhone.replaceAll(/\D/g, '');
    const normalizedPhone = rawPhone.startsWith('+') ? `+${digitsOnly}` : digitsOnly;

    if (digitsOnly.length < 10 || digitsOnly.length > 13) {
      setError('Please enter a valid phone number (10 to 13 digits).');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // 1. Fetch UPI ID from site settings
      const settingsRes = await apiClient.get<{ data: Record<string, string> }>('/settings');
      const settings = settingsRes.data.data ?? {};
      const fetchedUpiId = settings['upi_id'] ?? settings['whatsapp_number'] ?? '';
      setUpiId(fetchedUpiId);

      // 2. Create booking (guest — no auth required)
      const bookingRes = await apiClient.post<{
        data: { id: string; booking_ref: string };
      }>('/bookings', {
        theater_id:     store.theaterId,
        slot_id:        store.slotId,
        date:           store.date,
        duration_type:  store.duration,
        occasion:       store.occasion ?? undefined,
        occasion_name:  store.occasionName || undefined,
        num_adults:     2,
        num_children:   0,
        customer_name:  store.customerName,
        customer_phone: normalizedPhone,
        customer_email: store.customerEmail || undefined,
        coupon_code:    store.couponCode || undefined,
        referral_code:  store.referralCode || undefined,
        addon_ids:      store.addonIds,
        food_items:     store.foodItems.map((f) => ({
          food_item_id: f.food_item_id,
          variant_size: f.variant_size,
          quantity:     f.quantity,
        })),
        cake_id: store.cakeId ?? undefined,
      });

      setBookingId(bookingRes.data.data.id);
      setBookingRef(bookingRes.data.data.booking_ref);
      setStep('payment');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create booking. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  /** Submits UTR after customer has paid */
  const handleUtrSubmit = async () => {
    if (!utr.trim() || utr.trim().length < 6) {
      setError('Please enter a valid UPI transaction reference (UTR) — at least 6 characters.');
      return;
    }
    if (!bookingId) return;

    setProcessing(true);
    setError(null);

    try {
      await apiClient.patch(`/bookings/${bookingId}/upi-payment`, { utr: utr.trim() });
      store.resetBooking();
      setStep('success');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  /** Copy UPI ID to clipboard */
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* Clipboard API not available */
    }
  };

  // UPI deep link for QR code
  const upiDeepLink = upiId
    ? `upi://pay?pa=${encodeURIComponent(upiId)}&pn=The+Magic+Screen&am=${ADVANCE_AMOUNT}&cu=INR&tn=Theater+Booking+Advance`
    : '';
  const qrImageUrl = upiDeepLink
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiDeepLink)}`
    : '';

  const breakdown = theater
    ? store.calculateTotal({
        theaterData:   theater,
        extraAdults:   0,
        extraChildren: 0,
        addonPrices:   Object.fromEntries(addons.map((a) => [a.id, a.price])),
        cakePrice:     cake?.price ?? 0,
        couponDiscount: 0,
      })
    : null;

  const hasCoreSession = Boolean(store.theaterId && store.slotId && store.date);
  const hasCustomerDetails = Boolean(store.customerName.trim() && store.customerPhone.trim());
  const canAttemptConfirm = hasCoreSession && hasCustomerDetails;

  // ── SUCCESS SCREEN ───────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="min-h-screen pt-20 sm:pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-green-400" />
          </div>
          <h1
            className="text-3xl font-bold text-white mb-3"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Payment Submitted!
          </h1>
          <p className="text-[#888] mb-8">
            We've received your payment details. Your booking will be confirmed after verification (usually within 30 minutes).
          </p>

          {/* Booking ID */}
          <div className="p-6 rounded-2xl border border-[#D4A017]/40 bg-[#D4A017]/5 mb-6">
            <p className="text-sm text-[#888] mb-2">Your Booking ID</p>
            <p
              className="text-3xl font-bold text-[#D4A017] tracking-widest mb-3"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {bookingRef}
            </p>
            <button
              type="button"
              onClick={() => handleCopy(bookingRef ?? '')}
              className="flex items-center gap-2 mx-auto text-sm text-[#888] hover:text-white transition-colors"
            >
              {copied ? <CheckCircle2 size={14} className="text-green-400" /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy Booking ID'}
            </button>
          </div>

          <p className="text-xs text-[#666] mb-8">
            Save your Booking ID to track your booking status at any time.
          </p>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => router.push(`/booking?ref=${bookingRef ?? ''}`)}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#D4A017] text-black font-bold rounded-2xl hover:bg-[#D4A017]/90 transition-all"
            >
              Track My Booking <ArrowRight size={18} />
            </button>
            <button
              type="button"
              onClick={() => router.push('/')}
              className="w-full py-3.5 border border-white/10 text-[#888] rounded-2xl hover:bg-white/5 transition-all text-sm"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── UPI PAYMENT PANEL ────────────────────────────────────────────────────────
  if (step === 'payment') {
    return (
      <div className="min-h-screen pt-20 sm:pt-24 pb-16 px-4">
        <div className="max-w-md mx-auto">
          <div className="mb-8">
            <h1
              className="text-2xl font-bold text-white"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Complete Payment
            </h1>
            <p className="text-[#888] text-sm mt-1">
              Scan the QR code or use UPI ID to pay the advance.
            </p>
          </div>

          {/* Amount */}
          <div className="p-5 rounded-2xl border border-[#D4A017]/30 bg-[#D4A017]/5 mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-[#888]">Amount to pay now</p>
              <p className="text-xs text-[#555] mt-0.5">Balance paid at venue</p>
            </div>
            <p className="text-2xl font-bold text-[#D4A017]">{formatCurrency(ADVANCE_AMOUNT)}</p>
          </div>

          {/* QR Code — tap to open UPI app directly */}
          {qrImageUrl && (
            <div className="flex flex-col items-center mb-6">
              <a
                href={upiDeepLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 bg-white rounded-2xl shadow-lg mb-3 hover:scale-[1.02] transition-transform active:scale-[0.98]"
                title="Tap to pay with UPI app"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrImageUrl}
                  alt="UPI QR Code"
                  width={180}
                  height={180}
                  className="rounded-lg"
                />
              </a>
              <p className="text-xs text-[#888] text-center font-medium mb-1">
                📱 Tap QR to open payment app directly
              </p>
              <p className="text-xs text-[#555] text-center">
                Or scan with PhonePe / GPay / Paytm
              </p>
            </div>
          )}

          {/* UPI ID */}
          {upiId && (
            <div className="p-4 rounded-2xl border border-white/10 bg-[#1A1A1A] mb-6">
              <p className="text-xs text-[#666] mb-2">Or pay using UPI ID</p>
              <div className="flex items-center justify-between gap-3">
                <p className="font-mono font-semibold text-white text-sm sm:text-lg break-all">{upiId}</p>
                <button
                  type="button"
                  onClick={() => handleCopy(upiId)}
                  className="flex items-center gap-1.5 text-xs text-[#888] hover:text-[#D4A017] transition-colors shrink-0"
                >
                  {copied ? (
                    <CheckCircle2 size={14} className="text-green-400" />
                  ) : (
                    <Copy size={14} />
                  )}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}

          {/* Booking reference */}
          <div className="p-4 rounded-xl border border-white/10 bg-[#1A1A1A] mb-6">
            <p className="text-xs text-[#666] mb-1">Booking Reference</p>
            <p className="font-mono font-bold text-[#D4A017] break-all">{bookingRef}</p>
            <p className="text-xs text-[#555] mt-1">Add this as a note/remark when paying</p>
          </div>

          {/* UTR Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-2">
              <Smartphone size={14} className="inline mr-1.5 text-[#D4A017]" />
              UPI Transaction Reference (UTR)
            </label>
            <input
              type="text"
              value={utr}
              onChange={(e) => setUtr(e.target.value)}
              placeholder="e.g. 419823456789"
              className="w-full rounded-xl border border-white/10 bg-[#1A1A1A] px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]/50 placeholder:text-[#444]"
            />
            <p className="text-xs text-[#555] mt-1.5">
              Find the UTR/transaction ID in your UPI app after paying.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="button"
            onClick={handleUtrSubmit}
            disabled={processing || !utr.trim()}
            className="w-full flex items-center justify-center gap-3 py-4 bg-[#D4A017] text-black font-bold text-lg rounded-2xl hover:bg-[#D4A017]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(212,160,23,0.3)]"
          >
            {processing ? (
              <>
                <Loader2 size={20} className="animate-spin" /> Submitting...
              </>
            ) : (
              <>
                <CheckCircle2 size={20} /> I&apos;ve Paid — Confirm Booking
              </>
            )}
          </button>

          <p className="text-xs text-center text-[#555] mt-4">
            Your booking will be confirmed by the team after payment verification.
          </p>
        </div>
      </div>
    );
  }

  // ── SUMMARY SCREEN ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => router.push(`/theater/${params.id}/details`)}
            className="text-sm text-[#888] hover:text-white transition-colors flex items-center gap-1 mb-4"
          >
            <ChevronLeft size={14} /> Back to details
          </button>
          <h1
            className="text-2xl font-bold text-white"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Review &amp; Pay
          </h1>
          <p className="text-[#888] text-sm mt-1">
            One last check before we confirm your booking.
          </p>
        </div>

        <BookingStepIndicator steps={BOOKING_STEPS} currentStep={7} />
        <div className="mb-7 sm:mb-10" />

        {/* Summary Card */}
        {breakdown ? (
          <BookingSummaryCard
            breakdown={breakdown}
            theaterName={store.theaterName ?? ''}
            date={store.date ? formatDate(store.date) : '—'}
            slotName={store.slotName ?? '—'}
          />
        ) : (
          <div className="skeleton h-48 rounded-2xl mb-6" />
        )}

        {/* Payment info panel */}
        <div className="mt-6 p-5 rounded-2xl border border-[#D4A017]/30 bg-[#D4A017]/5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-white">Amount to pay now</span>
            <span className="text-xl font-bold text-[#D4A017]">{formatCurrency(ADVANCE_AMOUNT)}</span>
          </div>
          <p className="text-xs text-[#888]">
            ₹500 refundable + ₹200 non-refundable processing fee. Remaining balance paid at venue.
          </p>
        </div>

        {/* UPI info note */}
        <div className="flex items-start gap-3 p-4 rounded-xl border border-white/10 bg-[#1A1A1A] mb-6">
          <Smartphone size={16} className="text-[#D4A017] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-white">Pay via UPI</p>
            <p className="text-xs text-[#888] mt-0.5">
              You&apos;ll scan a QR code or use UPI ID (PhonePe / GPay / Paytm) and enter your transaction reference to confirm.
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {/* Confirm button */}
        <button
          type="button"
          onClick={handleCreateBooking}
          disabled={processing}
          className="w-full flex items-center justify-center gap-3 py-4 bg-[#D4A017] text-black font-bold text-lg rounded-2xl hover:bg-[#D4A017]/90 transition-all hover:scale-[1.01] disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(212,160,23,0.3)]"
        >
          {processing ? (
            <>
              <Loader2 size={20} className="animate-spin" /> Creating Booking...
            </>
          ) : (
            <>
              Confirm &amp; Pay {formatCurrency(ADVANCE_AMOUNT)} via UPI
            </>
          )}
        </button>

        {!processing && !canAttemptConfirm && (
          <p className="text-xs text-center text-red-400 mt-3">
            Please complete Date & Slot and Customer Details before confirming payment.
          </p>
        )}

        <p className="text-xs text-center text-[#888] mt-4">
          Secure UPI payment · Booking confirmed after verification
        </p>
      </div>
    </div>
  );
}
