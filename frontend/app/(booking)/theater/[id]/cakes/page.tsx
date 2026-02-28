/**
 * @file Booking wizard Step 3 — select cake (optional)
 * @module app/(booking)/theater/[id]/cakes/page
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useBookingStore } from '../../../../../store/bookingStore';
import { BookingStepIndicator } from '../../../../../components/booking/BookingStepIndicator';
import { CakeSelector } from '../../../../../components/booking/CakeSelector';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { apiClient } from '../../../../../lib/api';
import type { CakeItem } from '../../../../../types/addon';

/** Step labels for the booking wizard */
const BOOKING_STEPS = ['Date & Slot', 'Occasion', 'Cake', 'Add-Ons', 'Food', 'Details', 'Summary'];

export default function CakesPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const store = useBookingStore();

  const [cakes, setCakes] = useState<CakeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [egglessFilter, setEgglessFilter] = useState(false);

  useEffect(() => {
    apiClient
      .get<{ data: CakeItem[] }>('/cakes')
      .then((res) => setCakes(res.data.data ?? []))
      .catch(() => setCakes([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => router.push(`/theater/${params.id}/occasion`)}
            className="text-sm text-[#888] hover:text-white transition-colors flex items-center gap-1 mb-4"
          >
            <ChevronLeft size={14} /> Back
          </button>
          <h1
            className="text-2xl font-bold text-white"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Would you like a cake?
          </h1>
          <p className="text-[#888] text-sm mt-1">
            Optional — skip if you don't need one.
          </p>
        </div>

        {/* Step Indicator */}
        <BookingStepIndicator steps={BOOKING_STEPS} currentStep={3} />
        <div className="mb-10" />

        {/* Cake Selector */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-[#D4A017]" />
          </div>
        ) : (
          <CakeSelector
            cakes={cakes}
            selectedCakeId={store.cakeId}
            egglessFilter={egglessFilter}
            onCakeSelect={(id) => store.setCake(id)}
            onEgglessToggle={setEgglessFilter}
          />
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={() => router.push(`/theater/${params.id}/occasion`)}
            className="flex items-center gap-2 px-6 py-3 border border-white/20 text-white rounded-xl hover:bg-white/5 transition-all"
          >
            <ChevronLeft size={16} /> Back
          </button>
          <button
            type="button"
            onClick={() => router.push(`/theater/${params.id}/addons`)}
            className="flex items-center gap-2 px-8 py-3 bg-[#D4A017] text-black font-bold rounded-xl hover:bg-[#D4A017]/90 transition-all"
          >
            Continue <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
