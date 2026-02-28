/**
 * @file OccasionSelector.tsx
 * @description Occasion type selector with personalization name input for CineNest bookings.
 * Client Component — manages the occasion grid selection and name input field.
 */

'use client';

import { Check } from 'lucide-react';
import type { OccasionType } from '@/types/booking';
import { OCCASION_NAME_PROMPTS } from '@/lib/constants';

interface OccasionSelectorProps {
  /** The currently selected occasion type, or null if none. */
  selectedOccasion: OccasionType | null;
  /** The personalization name entered by the user (e.g. person's name). */
  occasionName: string;
  /** Callback when user picks a different occasion type. */
  onOccasionChange: (occasion: OccasionType) => void;
  /** Callback when user updates the personalization name. */
  onNameChange: (name: string) => void;
}

const OCCASIONS: { type: OccasionType; emoji: string; label: string }[] = [
  { type: 'birthday', emoji: '🎂', label: 'Birthday' },
  { type: 'anniversary', emoji: '💑', label: 'Anniversary' },
  { type: 'proposal', emoji: '💍', label: 'Proposal' },
  { type: 'date_night', emoji: '🌹', label: 'Date Night' },
  { type: 'baby_shower', emoji: '🍼', label: 'Baby Shower' },
  { type: 'farewell', emoji: '✈️', label: 'Farewell' },
  { type: 'reunion', emoji: '🤝', label: 'Reunion' },
  { type: 'movie_night', emoji: '🎬', label: 'Movie Night' },
  { type: 'other', emoji: '🎉', label: 'Other Celebration' },
];

const NAME_MAX = 20;

/**
 * Grid of occasion type cards with name personalization input.
 * The name input label adapts based on the selected occasion via OCCASION_NAME_PROMPTS.
 */
export function OccasionSelector({
  selectedOccasion,
  occasionName,
  onOccasionChange,
  onNameChange,
}: OccasionSelectorProps) {
  const namePrompt =
    selectedOccasion && OCCASION_NAME_PROMPTS[selectedOccasion]
      ? OCCASION_NAME_PROMPTS[selectedOccasion]
      : 'Personalization name';

  return (
    <div className="flex flex-col gap-6">
      {/* Occasion grid */}
      <div>
        <p className="text-sm font-medium text-gray-300 mb-3">Select Occasion</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {OCCASIONS.map(({ type, emoji, label }) => {
            const isSelected = selectedOccasion === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => onOccasionChange(type)}
                className={`relative flex flex-col items-center gap-2 px-3 py-4 rounded-xl border transition-all duration-200
                  ${isSelected
                    ? 'border-[#D4A017] bg-[#D4A017]/10 shadow-[0_0_12px_rgba(212,160,23,0.2)]'
                    : 'border-white/10 bg-[#1A1A1A] hover:border-[#D4A017]/40'
                  }`}
              >
                {isSelected && (
                  <span className="absolute top-2 right-2 flex items-center justify-center w-4 h-4 rounded-full bg-[#D4A017]">
                    <Check className="w-2.5 h-2.5 text-black" strokeWidth={3} />
                  </span>
                )}
                <span className="text-3xl" role="img" aria-label={label}>{emoji}</span>
                <span className={`text-xs font-medium text-center leading-snug ${isSelected ? 'text-[#D4A017]' : 'text-gray-300'}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Name input — only shown after selecting an occasion */}
      {selectedOccasion && (
        <div className="flex flex-col gap-2">
          <label htmlFor="occasion-name" className="text-sm font-medium text-gray-300">
            {namePrompt}
          </label>
          <div className="relative">
            <input
              id="occasion-name"
              type="text"
              value={occasionName}
              maxLength={NAME_MAX}
              placeholder="e.g. Priya"
              onChange={(e) => onNameChange(e.target.value.slice(0, NAME_MAX))}
              className="w-full sm:w-80 px-4 py-2.5 rounded-lg bg-[#1A1A1A] border border-white/15
                         text-white text-sm placeholder:text-gray-600
                         focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/40 transition-colors"
            />
            <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${occasionName.length >= NAME_MAX ? 'text-red-400' : 'text-gray-500'}`}>
              {occasionName.length}/{NAME_MAX}
            </span>
          </div>
          <p className="text-xs text-gray-500">
            This name will be used for banners, cake writing, and decorations.
          </p>
        </div>
      )}
    </div>
  );
}
