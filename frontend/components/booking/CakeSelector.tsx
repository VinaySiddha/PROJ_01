/**
 * @file CakeSelector.tsx
 * @description Cake selection step in the The Magic Screen booking flow.
 * Client Component — manages eggless filter toggle and selected cake state.
 */

'use client';

import { Check } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import type { CakeItem } from '@/types/addon';

interface CakeSelectorProps {
  /** Full list of available cake options from the API. */
  cakes: CakeItem[];
  /** ID of the currently selected cake, or null if "No Cake" is chosen. */
  selectedCakeId: string | null;
  /** Whether to show only eggless cakes. */
  egglessFilter: boolean;
  /** Callback when user selects a cake (null = No Cake). */
  onCakeSelect: (cakeId: string | null) => void;
  /** Callback when egg/eggless toggle changes. */
  onEgglessToggle: (value: boolean) => void;
}

/**
 * Cake selection grid with egg/eggless toggle filter.
 * First card is always "No Cake". Supports visual selection state with gold border.
 */
export function CakeSelector({
  cakes,
  selectedCakeId,
  egglessFilter,
  onCakeSelect,
  onEgglessToggle,
}: Readonly<CakeSelectorProps>) {
  const filteredCakes = egglessFilter ? cakes.filter((c) => c.is_eggless) : cakes;

  return (
    <div className="flex flex-col gap-6">
      {/* Egg / Eggless toggle */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-gray-300">Cake Preference</p>
        <div className="grid grid-cols-2 w-full max-w-sm rounded-lg border border-white/15 overflow-hidden">
          {[
            { value: false, label: '🥚 With Egg' },
            { value: true, label: '🌱 Eggless' },
          ].map(({ value, label }) => (
            <button
              key={String(value)}
              type="button"
              onClick={() => onEgglessToggle(value)}
              className={`px-3 sm:px-5 py-2.5 text-sm font-medium transition-colors duration-200 ${
                egglessFilter === value
                  ? 'bg-[#D4A017] text-black'
                  : 'bg-[#1A1A1A] text-gray-300 hover:bg-white/5'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Cake grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {/* No Cake option */}
        <button
          type="button"
          onClick={() => onCakeSelect(null)}
          className={`relative flex min-h-[168px] flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all duration-200
            ${selectedCakeId === null
              ? 'border-[#D4A017] bg-[#D4A017]/10 shadow-[0_0_10px_rgba(212,160,23,0.2)]'
              : 'border-white/10 bg-[#1A1A1A] hover:border-[#D4A017]/40'
            }`}
        >
          {selectedCakeId === null && (
            <span className="absolute top-2 right-2 flex items-center justify-center w-4 h-4 rounded-full bg-[#D4A017]">
              <Check className="w-2.5 h-2.5 text-black" strokeWidth={3} />
            </span>
          )}
          <span className="text-3xl" role="img" aria-label="No cake">🚫</span>
          <span className="text-xs font-semibold text-gray-300 text-center">No Cake</span>
          <span className="text-xs text-gray-500">Skip this step</span>
        </button>

        {/* Cake cards */}
        {filteredCakes.map((cake) => {
          const isSelected = selectedCakeId === cake.id;
          return (
            <button
              key={cake.id}
              type="button"
              onClick={() => onCakeSelect(cake.id)}
              className={`relative flex min-h-[168px] flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all duration-200
                ${isSelected
                  ? 'border-[#D4A017] bg-[#D4A017]/10 shadow-[0_0_10px_rgba(212,160,23,0.2)]'
                  : 'border-white/10 bg-[#1A1A1A] hover:border-[#D4A017]/40'
                }`}
            >
              {isSelected && (
                <span className="absolute top-2 right-2 flex items-center justify-center w-4 h-4 rounded-full bg-[#D4A017]">
                  <Check className="w-2.5 h-2.5 text-black" strokeWidth={3} />
                </span>
              )}
              {/* Placeholder image */}
              <div className="w-16 h-16 rounded-lg bg-[#2A2A2A] flex items-center justify-center text-3xl overflow-hidden">
                {cake.image_url
                  ? <img src={cake.image_url} alt={cake.name} className="w-full h-full object-cover rounded-lg" />
                  : '🎂'}
              </div>
              <span className="text-xs font-semibold text-white text-center leading-snug">{cake.name}</span>
              {cake.is_eggless && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-green-900/50 text-green-400 font-medium">
                  Eggless
                </span>
              )}
              <span className="text-xs font-bold text-[#D4A017]">{formatCurrency(cake.price)}</span>
            </button>
          );
        })}
      </div>

      {filteredCakes.length === 0 && egglessFilter && (
        <p className="text-sm text-gray-500 text-center py-4">
          No eggless options available. Toggle to see all cakes.
        </p>
      )}
    </div>
  );
}
