/**
 * @file SlotPicker.tsx
 * @description Date and time slot selection step in the The Magic Screen booking flow.
 * Client Component — manages date input and slot/duration selection state callbacks.
 */

'use client';

import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import type { SlotAvailabilityResult } from '@/types/booking';

interface SlotPickerProps {
  /** Available slots with their availability status. */
  slots: SlotAvailabilityResult[];
  /** Currently selected slot ID or null. */
  selectedSlotId: string | null;
  /** Currently selected booking duration. */
  selectedDuration: 'standard' | 'short';
  /** Callback fired when a slot is chosen. */
  onSlotSelect: (slotId: string) => void;
  /** Callback fired when the duration toggle changes. */
  onDurationChange: (duration: 'standard' | 'short') => void;
  /** Whether slot data is being fetched. */
  isLoading: boolean;
  /** Currently selected date (YYYY-MM-DD). */
  selectedDate: string;
  /** Callback when user picks a new date. */
  onDateChange: (date: string) => void;
  /** Price difference between standard and short duration (shown in toggle). */
  shortSlotDiscount?: number;
}

const SLOT_ICONS: Record<string, string> = {
  Morning: '🌅',
  Afternoon: '☀️',
  Evening: '🌆',
  Night: '🌙',
};

/**
 * Slot and duration picker for the booking wizard.
 * Displays a styled date input, four time-slot cards with status badges,
 * and a Standard vs Short duration toggle.
 */
export function SlotPicker({
  slots,
  selectedSlotId,
  selectedDuration,
  onSlotSelect,
  onDurationChange,
  isLoading,
  selectedDate,
  onDateChange,
  shortSlotDiscount,
}: Readonly<SlotPickerProps>) {
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="flex flex-col gap-6">
      {/* Date picker */}
      <div className="flex flex-col gap-2">
        <label htmlFor="booking-date" className="text-sm font-medium text-gray-300">
          Select Date
        </label>
        <input
          id="booking-date"
          type="date"
          min={today}
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="w-full sm:w-64 px-4 py-2.5 rounded-lg bg-[#1A1A1A] border border-white/15
                     text-white text-sm focus:outline-none focus:border-[#D4A017]
                     focus:ring-1 focus:ring-[#D4A017]/40 transition-colors
                     [color-scheme:dark]"
        />
      </div>

      {/* Slot cards */}
      <div>
        <p className="text-sm font-medium text-gray-300 mb-3">Select Time Slot</p>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="md" color="gold" />
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {slots.map((slot) => {
              const isSelected = selectedSlotId === slot.slot_id;
              const isUnavailable = slot.status === 'booked';
              const isLocked = slot.status === 'locked';
              const isDisabled = isUnavailable || isLocked;
              let cardStyleClass = 'border-white/10 bg-[#1A1A1A] hover:border-[#D4A017]/50 cursor-pointer';
              if (isSelected) {
                cardStyleClass = 'border-[#D4A017] bg-[#D4A017]/10 shadow-[0_0_12px_rgba(212,160,23,0.25)]';
              } else if (isDisabled) {
                cardStyleClass = 'border-white/8 bg-[#1A1A1A]/50 opacity-50 cursor-not-allowed';
              }

              return (
                <button
                  key={slot.slot_id}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => !isDisabled && onSlotSelect(slot.slot_id)}
                  className={`relative flex min-h-[122px] flex-col items-center justify-center gap-1.5 p-3 sm:p-4 rounded-xl border transition-all duration-200 ${cardStyleClass}`}
                >
                  <span className="text-2xl">{SLOT_ICONS[slot.name] ?? '🎬'}</span>
                  <span className="text-xs sm:text-sm font-semibold text-white">{slot.name}</span>
                  <span className="text-[11px] sm:text-xs text-gray-400 text-center leading-tight">{slot.time_range}</span>

                  {isUnavailable && (
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-900/80 text-red-300 uppercase">
                      Booked
                    </span>
                  )}
                  {isLocked && (
                    <span className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-900/80 text-yellow-300 uppercase">
                      <LoadingSpinner size="sm" color="white" />
                      Hold
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Duration toggle */}
      <div>
        <p className="text-sm font-medium text-gray-300 mb-3">Booking Duration</p>
        <div className="grid grid-cols-2 w-full max-w-md rounded-lg border border-white/15 overflow-hidden">
          {(['standard', 'short'] as const).map((dur) => {
            const durationName = dur === 'standard' ? 'Standard' : 'Short';
            let durationLabel = '2.5 hours';
            if (dur === 'short') {
              durationLabel = '1.5 hours';
              if (shortSlotDiscount) {
                durationLabel += ` · Save ₹${shortSlotDiscount}`;
              }
            }

            return (
              <button
                key={dur}
                type="button"
                onClick={() => onDurationChange(dur)}
                className={`flex min-h-[72px] flex-col items-center justify-center px-3 sm:px-6 py-3 text-sm text-center transition-colors duration-200 ${
                  selectedDuration === dur
                    ? 'bg-[#D4A017] text-black font-semibold'
                    : 'bg-[#1A1A1A] text-gray-300 hover:bg-white/5'
                }`}
              >
                <span className="font-semibold capitalize">{durationName}</span>
                <span className="text-[11px] sm:text-xs opacity-80 leading-tight">{durationLabel}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
