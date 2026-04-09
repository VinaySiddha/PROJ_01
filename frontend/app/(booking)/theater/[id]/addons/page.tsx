/**
 * @file Booking wizard Step 4 — select add-ons (optional)
 * @module app/(booking)/theater/[id]/addons/page
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useBookingStore } from '../../../../../store/bookingStore';
import { BookingStepIndicator } from '../../../../../components/booking/BookingStepIndicator';
import { AddOnSelector } from '../../../../../components/booking/AddOnSelector';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { apiClient } from '../../../../../lib/api';
import type { AddonItem } from '../../../../../types/addon';

/** Step labels for the booking wizard */
const BOOKING_STEPS = ['Date & Slot', 'Occasion', 'Cake', 'Add-Ons', 'Food', 'Details', 'Summary'];

export default function AddonsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const store = useBookingStore();

  const [addons, setAddons] = useState<AddonItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get<{ data: AddonItem[] }>('/addons')
      .then((res) => setAddons(res.data.data ?? []))
      .catch(() => setAddons([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => router.push(`/theater/${params.id}/cakes`)}
            className="text-sm text-[#888] hover:text-white transition-colors flex items-center gap-1 mb-4"
          >
            <ChevronLeft size={14} /> Back
          </button>
          <h1
            className="text-2xl font-bold text-white"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Enhance your experience
          </h1>
          <p className="text-[#888] text-sm mt-1">
            Optional decorations, roses, and photography.
          </p>
        </div>

        {/* Step Indicator */}
        <BookingStepIndicator steps={BOOKING_STEPS} currentStep={4} />
        <div className="mb-7 sm:mb-10" />

        {/* Add-On Selector */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-[#D4A017]" />
          </div>
        ) : (
          <AddOnSelector
            addons={addons}
            selectedAddonIds={store.addonIds}
            onToggleAddon={(addonId) => store.toggleAddon(addonId)}
          />
        )}

        {/* Navigation */}
        <div className="mt-8 flex flex-col-reverse sm:flex-row gap-3 sm:justify-between">
          <button
            type="button"
            onClick={() => router.push(`/theater/${params.id}/cakes`)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 border border-white/20 text-white rounded-xl hover:bg-white/5 transition-all"
          >
            <ChevronLeft size={16} /> Back
          </button>
          <button
            type="button"
            onClick={() => router.push(`/theater/${params.id}/food`)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-[#D4A017] text-black font-bold rounded-xl hover:bg-[#D4A017]/90 transition-all"
          >
            Continue <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
