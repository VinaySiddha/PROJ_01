/**
 * @file Booking wizard Step 1 — select date and time slot
 * @module app/(booking)/theater/[id]/book/page
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useBookingStore } from '../../../../../store/bookingStore';
import { BookingStepIndicator } from '../../../../../components/booking/BookingStepIndicator';
import { SlotPicker } from '../../../../../components/booking/SlotPicker';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '../../../../../lib/api';
import type { Theater } from '../../../../../types/theater';
import type { DurationType } from '../../../../../types/booking';

/** Step labels for the booking wizard */
const BOOKING_STEPS = ['Date & Slot', 'Occasion', 'Cake', 'Add-Ons', 'Food', 'Details', 'Summary'];

/** Raw slot shape returned by the backend API */
interface BackendSlot {
  slot_id: string;
  slot_name: string;
  start_time: string;  // e.g. "18:00"
  end_time: string;    // e.g. "20:30"
  is_available: boolean;
  is_locked: boolean;
}

/** Slot availability shape consumed by SlotPicker */
interface SlotAvailabilityResult {
  slot_id: string;
  name: string;
  time_range: string;
  status: 'available' | 'booked' | 'locked';
}

/** Converts "18:00" → "6:00 PM" */
function fmt12h(time: string): string {
  const [hStr, mStr] = time.split(':');
  const h = parseInt(hStr ?? '0', 10);
  const m = parseInt(mStr ?? '0', 10);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}

/** Transforms a raw backend slot into the SlotPicker-friendly shape */
function toPickerSlot(s: BackendSlot): SlotAvailabilityResult {
  return {
    slot_id:    s.slot_id,
    name:       s.slot_name,
    time_range: `${fmt12h(s.start_time)} – ${fmt12h(s.end_time)}`,
    status:     s.is_locked ? 'locked' : s.is_available ? 'available' : 'booked',
  };
}

export default function BookSlotPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const store = useBookingStore();

  const [theater, setTheater] = useState<Theater | null>(null);
  const [slots, setSlots] = useState<SlotAvailabilityResult[]>([]);
  const [loadingTheater, setLoadingTheater] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0] ?? '';
  const [selectedDate, setSelectedDate] = useState<string>(store.date ?? today);

  // Fetch theater details on mount
  useEffect(() => {
    apiClient
      .get<{ data: Theater }>(`/theaters/${params.id}`)
      .then((res) => {
        const t = res.data.data;
        setTheater(t);
        store.setTheater({ theaterId: t.id, theaterName: t.name });
      })
      .catch(() => setError('Unable to load theater details. Please go back and try again.'))
      .finally(() => setLoadingTheater(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  // Fetch slots whenever date changes
  useEffect(() => {
    if (!selectedDate) return;
    setLoadingSlots(true);
    apiClient
      .get<{ data: BackendSlot[] }>(`/theaters/${params.id}/slots?date=${selectedDate}`)
      .then((res) => setSlots((res.data.data ?? []).map(toPickerSlot)))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, params.id]);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    store.setDate(date);
    // Clear selected slot when date changes
    store.setSlot({ slotId: '', slotName: '' });
  };

  const handleSlotSelect = (slotId: string) => {
    const slot = slots.find((s) => s.slot_id === slotId);
    const slotName = slot
      ? `${slot.name} · ${slot.time_range}`
      : '';
    store.setSlot({ slotId, slotName });
  };

  const handleDurationChange = (duration: DurationType) => {
    store.setDuration(duration);
  };

  /** Handle Continue — validate slot is selected before navigating */
  const handleContinue = () => {
    if (!store.slotId) {
      setError('Please select a time slot to continue.');
      return;
    }
    setError(null);
    router.push(`/theater/${params.id}/occasion`);
  };

  const shortSlotDiscount = theater
    ? theater.base_price - theater.short_slot_price
    : undefined;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/theaters"
            className="text-sm text-[#888] hover:text-white transition-colors flex items-center gap-1 mb-4"
          >
            <ChevronLeft size={14} /> Back to theaters
          </Link>
          {loadingTheater ? (
            <div className="skeleton h-8 w-48 rounded-lg" />
          ) : (
            <h1
              className="text-2xl font-bold text-white"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {theater?.name ?? 'Book Theater'}
            </h1>
          )}
        </div>

        {/* Step Indicator */}
        <BookingStepIndicator steps={BOOKING_STEPS} currentStep={1} />
        <div className="mb-10" />

        {/* Slot Picker — includes date picker and duration toggle */}
        <SlotPicker
          slots={slots}
          selectedSlotId={store.slotId}
          selectedDuration={store.duration}
          onSlotSelect={handleSlotSelect}
          onDurationChange={handleDurationChange}
          isLoading={loadingSlots}
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          shortSlotDiscount={shortSlotDiscount}
        />

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-end mt-8">
          <button
            type="button"
            onClick={handleContinue}
            className="flex items-center gap-2 px-8 py-3.5 bg-[#D4A017] text-black font-bold rounded-xl hover:bg-[#D4A017]/90 transition-all disabled:opacity-50"
          >
            Continue <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
