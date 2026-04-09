/**
 * @file Booking wizard Step 6 — customer details and coupon code
 * @module app/(booking)/theater/[id]/details/page
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useBookingStore } from '../../../../../store/bookingStore';
import { useAuthStore } from '../../../../../store/authStore';
import { BookingStepIndicator } from '../../../../../components/booking/BookingStepIndicator';
import { BookingSummaryCard } from '../../../../../components/booking/BookingSummaryCard';
import { ChevronLeft, ChevronRight, Tag, Loader2 } from 'lucide-react';
import { apiClient } from '../../../../../lib/api';
import { formatCurrency, formatDate } from '../../../../../lib/formatters';
import type { Theater } from '../../../../../types/theater';
import type { AddonItem } from '../../../../../types/addon';

/** Step labels for the booking wizard */
const BOOKING_STEPS = ['Date & Slot', 'Occasion', 'Cake', 'Add-Ons', 'Food', 'Details', 'Summary'];

export default function DetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const store = useBookingStore();
  const { customer } = useAuthStore();

  const [name, setName] = useState(customer?.name ?? store.customerName);
  const [phone, setPhone] = useState(customer?.phone ?? store.customerPhone);
  const [email, setEmail] = useState(store.customerEmail);
  const [couponCode, setCouponCode] = useState(store.couponCode);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guestCount, setGuestCount] = useState(2);

  // Live theater + addon data for price calculation
  const [theater, setTheater] = useState<Theater | null>(null);
  const [addons, setAddons] = useState<AddonItem[]>([]);

  useEffect(() => {
    // Fetch theater for pricing
    apiClient
      .get<{ data: Theater }>(`/theaters/${params.id}`)
      .then((res) => setTheater(res.data.data))
      .catch(() => {/* Non-critical for this step */});
    // Fetch addons for pricing
    apiClient
      .get<{ data: AddonItem[] }>('/addons')
      .then((res) => setAddons(res.data.data ?? []))
      .catch(() => {/* Non-critical */});
  }, [params.id]);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError(null);
    try {
      const res = await apiClient.post<{ data: { discountAmount: number } }>(
        '/bookings/validate-coupon',
        { code: couponCode.trim().toUpperCase() },
      );
      const discount = res.data.data.discountAmount;
      setCouponDiscount(discount);
      store.setCouponCode(couponCode.trim().toUpperCase());
    } catch {
      setCouponError('Invalid or expired coupon code.');
      setCouponDiscount(0);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleContinue = () => {
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!phone.trim() || phone.replaceAll(/\D/g, '').length < 10) {
      setError('Please enter a valid phone number.');
      return;
    }
    setError(null);
    store.setCustomerDetails({
      customerName: name,
      customerPhone: phone,
      customerEmail: email,
    });
    router.push(`/theater/${params.id}/summary`);
  };

  // Build breakdown for summary card if we have theater data
  const breakdown = theater
    ? store.calculateTotal({
        theaterData: theater,
        extraAdults: Math.max(0, guestCount - theater.base_capacity),
        extraChildren: 0,
        addonPrices: Object.fromEntries(
          addons.map((a) => [a.id, a.price]),
        ),
        cakePrice: 0,
        couponDiscount,
      })
    : null;

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => router.push(`/theater/${params.id}/food`)}
            className="text-sm text-[#888] hover:text-white transition-colors flex items-center gap-1 mb-4"
          >
            <ChevronLeft size={14} /> Back
          </button>
          <h1
            className="text-2xl font-bold text-white"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Your Details
          </h1>
        </div>

        {/* Step Indicator */}
        <BookingStepIndicator steps={BOOKING_STEPS} currentStep={6} />
        <div className="mb-7 sm:mb-10" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Form */}
          <div className="space-y-5">
            {/* Guest count */}
            <div>
              <p className="block text-sm font-medium text-white mb-2">
                Number of Guests
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                  className="w-9 h-9 rounded-lg border border-white/20 flex items-center justify-center text-white hover:bg-white/5 transition-colors"
                >
                  −
                </button>
                <span className="text-lg font-bold text-white w-8 text-center">
                  {guestCount}
                </span>
                <button
                  type="button"
                  onClick={() => setGuestCount(guestCount + 1)}
                  className="w-9 h-9 rounded-lg border border-white/20 flex items-center justify-center text-white hover:bg-white/5 transition-colors"
                >
                  +
                </button>
              </div>
              {theater && guestCount > theater.base_capacity && (
                <p className="text-xs text-[#D4A017] mt-1">
                  Extra guest charges apply above {theater.base_capacity} guests.
                </p>
              )}
            </div>

            {/* Name */}
            <div>
              <label htmlFor="details-name" className="block text-sm font-medium text-white mb-2">
                Full Name *
              </label>
              <input
                id="details-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full rounded-xl border border-white/10 bg-[#1A1A1A] px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]/50 placeholder:text-[#555]"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="details-phone" className="block text-sm font-medium text-white mb-2">
                Phone Number *
              </label>
              <input
                id="details-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full rounded-xl border border-white/10 bg-[#1A1A1A] px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]/50 placeholder:text-[#555]"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="details-email" className="block text-sm font-medium text-white mb-2">
                Email{' '}
                <span className="text-[#888] font-normal">(optional)</span>
              </label>
              <input
                id="details-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full rounded-xl border border-white/10 bg-[#1A1A1A] px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]/50 placeholder:text-[#555]"
              />
            </div>

            {/* Coupon */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Coupon Code{' '}
                <span className="text-[#888] font-normal">(optional)</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="ENTER CODE"
                  className="flex-1 rounded-xl border border-white/10 bg-[#1A1A1A] px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]/50 placeholder:text-[#555] uppercase"
                />
                <button
                  type="button"
                  onClick={applyCoupon}
                  disabled={couponLoading || !couponCode.trim()}
                  className="w-full sm:w-auto flex items-center justify-center gap-1 px-4 py-3 border border-[#D4A017]/50 text-[#D4A017] rounded-xl text-sm hover:bg-[#D4A017]/10 transition-all disabled:opacity-50"
                >
                  {couponLoading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Tag size={14} />
                  )}
                  Apply
                </button>
              </div>
              {couponError && (
                <p className="text-xs text-red-400 mt-1">{couponError}</p>
              )}
              {couponDiscount > 0 && (
                <p className="text-xs text-green-400 mt-1">
                  Coupon applied! Saving {formatCurrency(couponDiscount)}
                </p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}
          </div>

          {/* Summary Card */}
          <div>
            {breakdown ? (
              <BookingSummaryCard
                breakdown={breakdown}
                theaterName={store.theaterName ?? ''}
                date={store.date ? formatDate(store.date) : '—'}
                slotName={store.slotName ?? '—'}
              />
            ) : (
              <div className="rounded-xl border border-white/10 bg-[#1A1A1A] p-6 text-center text-[#888] text-sm">
                <p>Price breakdown will appear here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex flex-col-reverse sm:flex-row gap-3 sm:justify-between">
          <button
            type="button"
            onClick={() => router.push(`/theater/${params.id}/food`)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 border border-white/20 text-white rounded-xl hover:bg-white/5 transition-all"
          >
            <ChevronLeft size={16} /> Back
          </button>
          <button
            type="button"
            onClick={handleContinue}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-[#D4A017] text-black font-bold rounded-xl hover:bg-[#D4A017]/90 transition-all"
          >
            Review Order <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
