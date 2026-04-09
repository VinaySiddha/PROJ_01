/**
 * @file Booking wizard Step 2 — select occasion and personalization name
 * @module app/(booking)/theater/[id]/occasion/page
 */
'use client';

import { useRouter, useParams } from 'next/navigation';
import { useBookingStore } from '../../../../../store/bookingStore';
import { BookingStepIndicator } from '../../../../../components/booking/BookingStepIndicator';
import { OccasionSelector } from '../../../../../components/booking/OccasionSelector';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import type { OccasionType } from '../../../../../types/booking';

/** Step labels for the booking wizard */
const BOOKING_STEPS = ['Date & Slot', 'Occasion', 'Cake', 'Add-Ons', 'Food', 'Details', 'Summary'];

export default function OccasionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const store = useBookingStore();
  const [error, setError] = useState<string | null>(null);

  const handleOccasionChange = (occasion: OccasionType) => {
    store.setOccasion(occasion, store.occasionName);
  };

  const handleNameChange = (name: string) => {
    store.setOccasion(store.occasion ?? 'other', name);
  };

  const handleContinue = () => {
    if (!store.occasion) {
      setError('Please select an occasion to continue.');
      return;
    }
    setError(null);
    router.push(`/theater/${params.id}/cakes`);
  };

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => router.push(`/theater/${params.id}/book`)}
            className="text-sm text-[#888] hover:text-white transition-colors flex items-center gap-1 mb-4"
          >
            <ChevronLeft size={14} /> Back
          </button>
          <h1
            className="text-2xl font-bold text-white"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            What's the occasion?
          </h1>
          <p className="text-[#888] text-sm mt-1">
            We'll personalize your experience based on this.
          </p>
        </div>

        {/* Step Indicator */}
        <BookingStepIndicator steps={BOOKING_STEPS} currentStep={2} />
        <div className="mb-7 sm:mb-10" />

        {/* Occasion Selector */}
        <OccasionSelector
          selectedOccasion={store.occasion}
          occasionName={store.occasionName}
          onOccasionChange={handleOccasionChange}
          onNameChange={handleNameChange}
        />

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex flex-col-reverse sm:flex-row gap-3 sm:justify-between">
          <button
            type="button"
            onClick={() => router.push(`/theater/${params.id}/book`)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 border border-white/20 text-white rounded-xl hover:bg-white/5 transition-all"
          >
            <ChevronLeft size={16} /> Back
          </button>
          <button
            type="button"
            onClick={handleContinue}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-[#D4A017] text-black font-bold rounded-xl hover:bg-[#D4A017]/90 transition-all"
          >
            Continue <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
