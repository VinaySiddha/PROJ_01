/**
 * @file Booking wizard Step 7 — final summary and Razorpay payment
 * @module app/(booking)/theater/[id]/summary/page
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useBookingStore } from '../../../../../store/bookingStore';
import { BookingStepIndicator } from '../../../../../components/booking/BookingStepIndicator';
import { BookingSummaryCard } from '../../../../../components/booking/BookingSummaryCard';
import { ChevronLeft, CreditCard, Loader2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../../../../../lib/formatters';
import { ADVANCE_AMOUNT } from '../../../../../lib/constants';
import { apiClient } from '../../../../../lib/api';
import type { Theater } from '../../../../../types/theater';
import type { AddonItem, CakeItem } from '../../../../../types/addon';

/** Step labels for the booking wizard */
const BOOKING_STEPS = ['Date & Slot', 'Occasion', 'Cake', 'Add-Ons', 'Food', 'Details', 'Summary'];

/** Razorpay global type augmentation */
declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open(): void };
  }
}

export default function SummaryPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const store = useBookingStore();

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live data for price calculation
  const [theater, setTheater] = useState<Theater | null>(null);
  const [addons, setAddons] = useState<AddonItem[]>([]);
  const [cake, setCake] = useState<CakeItem | null>(null);

  useEffect(() => {
    // Fetch theater
    apiClient
      .get<{ data: Theater }>(`/theaters/${params.id}`)
      .then((res) => setTheater(res.data.data))
      .catch(() => {/* Non-critical */});
    // Fetch addons
    apiClient
      .get<{ data: AddonItem[] }>('/addons')
      .then((res) => setAddons(res.data.data ?? []))
      .catch(() => {/* Non-critical */});
    // Fetch selected cake if any
    if (store.cakeId) {
      apiClient
        .get<{ data: CakeItem }>(`/cakes/${store.cakeId}`)
        .then((res) => setCake(res.data.data))
        .catch(() => {/* Non-critical */});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, store.cakeId]);

  /** Load Razorpay script dynamically */
  const loadRazorpay = (): Promise<boolean> =>
    new Promise((resolve) => {
      if (typeof window !== 'undefined' && window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handlePayment = async () => {
    setProcessing(true);
    setError(null);

    try {
      // 1. Create booking on backend
      const bookingPayload = {
        theater_id: store.theaterId,
        slot_id: store.slotId,
        date: store.date,
        duration_type: store.duration,
        occasion: store.occasion,
        occasion_name: store.occasionName,
        num_adults: 2,
        num_children: 0,
        customer_name: store.customerName,
        customer_phone: store.customerPhone,
        customer_email: store.customerEmail || undefined,
        coupon_code: store.couponCode || undefined,
        referral_code: store.referralCode || undefined,
        addon_ids: store.addonIds,
        food_items: store.foodItems.map((f) => ({
          food_item_id: f.food_item_id,
          quantity: f.quantity,
        })),
        cake_id: store.cakeId ?? undefined,
        lock_id: '',
      };

      const bookingRes = await apiClient.post<{ data: { id: string } }>(
        '/bookings',
        bookingPayload,
      );
      const bookingId = bookingRes.data.data.id;

      // 2. Create Razorpay order
      const orderRes = await apiClient.post<{
        data: { id: string; currency: string; amount: number };
      }>('/payments/razorpay/order', { booking_id: bookingId });
      const order = orderRes.data.data;

      // 3. Load Razorpay SDK
      const loaded = await loadRazorpay();
      if (!loaded) {
        setError('Payment service unavailable. Please try again.');
        setProcessing(false);
        return;
      }

      // 4. Open Razorpay checkout
      const rzp = new window.Razorpay({
        key: process.env['NEXT_PUBLIC_RAZORPAY_KEY_ID'],
        amount: order.amount,
        currency: order.currency,
        name: 'The Magic Screen',
        description: `Theater booking — ${store.occasion ?? 'celebration'}`,
        order_id: order.id,
        prefill: {
          name: store.customerName,
          contact: store.customerPhone,
          email: store.customerEmail || undefined,
        },
        theme: { color: '#D4A017' },
        handler: (response: Record<string, string>) => {
          // Payment success — reset wizard and redirect
          store.resetBooking();
          router.push(
            `/my-bookings?ref=${response['razorpay_order_id'] ?? ''}`,
          );
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
            setError(
              'Payment cancelled. Your booking slot is held for 10 minutes.',
            );
          },
        },
      });

      rzp.open();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Failed to initiate payment. Please try again.';
      setError(msg);
      setProcessing(false);
    }
  };

  // Build breakdown for summary card
  const breakdown = theater
    ? store.calculateTotal({
        theaterData: theater,
        extraAdults: 0,
        extraChildren: 0,
        addonPrices: Object.fromEntries(addons.map((a) => [a.id, a.price])),
        cakePrice: cake?.price ?? 0,
        couponDiscount: 0,
      })
    : null;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
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

        {/* Step Indicator */}
        <BookingStepIndicator steps={BOOKING_STEPS} currentStep={7} />
        <div className="mb-10" />

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
            <span className="text-sm font-semibold text-white">
              Amount to pay now
            </span>
            <span className="text-xl font-bold text-[#D4A017]">
              {formatCurrency(ADVANCE_AMOUNT)}
            </span>
          </div>
          <p className="text-xs text-[#888]">
            ₹500 refundable + ₹200 non-refundable processing fee. Remaining
            balance paid at venue.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Pay button */}
        <button
          type="button"
          onClick={handlePayment}
          disabled={processing}
          className="w-full flex items-center justify-center gap-3 py-4 bg-[#D4A017] text-black font-bold text-lg rounded-2xl hover:bg-[#D4A017]/90 transition-all hover:scale-[1.01] disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(212,160,23,0.3)]"
        >
          {processing ? (
            <>
              <Loader2 size={20} className="animate-spin" /> Processing...
            </>
          ) : (
            <>
              <CreditCard size={20} /> Pay {formatCurrency(ADVANCE_AMOUNT)} to Confirm
            </>
          )}
        </button>

        <p className="text-xs text-center text-[#888] mt-4">
          Secured by Razorpay · SSL encrypted · No card details stored
        </p>
      </div>
    </div>
  );
}
