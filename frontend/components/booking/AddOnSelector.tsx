/**
 * @file AddOnSelector.tsx
 * @description Add-on selection step for the CineNest booking flow.
 * Client Component — manages the toggle selection of individual add-on items
 * and displays a running total of selected add-ons.
 */

'use client';

import { Check } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import type { AddonItem } from '@/types/addon';

interface AddOnSelectorProps {
  /** Full list of available add-ons from the API. */
  addons: AddonItem[];
  /** IDs of currently selected add-ons. */
  selectedAddonIds: string[];
  /** Callback fired when user toggles an add-on on or off. */
  onToggleAddon: (addonId: string) => void;
}

/** Group add-ons by their category field. */
function groupByCategory(items: AddonItem[]): Record<string, AddonItem[]> {
  return items.reduce<Record<string, AddonItem[]>>((acc, item) => {
    const cat = item.category ?? 'Other';
    (acc[cat] ??= []).push(item);
    return acc;
  }, {});
}

/**
 * Add-on selector grouped by category.
 * Each card shows icon/image, name, price, and a checkbox-style selection indicator.
 * A running total of selected add-ons is displayed at the bottom.
 */
export function AddOnSelector({
  addons,
  selectedAddonIds,
  onToggleAddon,
}: AddOnSelectorProps) {
  const grouped = groupByCategory(addons);
  const selectedTotal = addons
    .filter((a) => selectedAddonIds.includes(a.id))
    .reduce((sum, a) => sum + a.price, 0);

  return (
    <div className="flex flex-col gap-8">
      {Object.entries(grouped).map(([category, items]) => (
        <section key={category}>
          <h4 className="text-xs font-semibold text-[#D4A017] uppercase tracking-widest mb-3">
            {category}
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {items.map((addon) => {
              const isSelected = selectedAddonIds.includes(addon.id);
              return (
                <button
                  key={addon.id}
                  type="button"
                  onClick={() => onToggleAddon(addon.id)}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border text-left
                    transition-all duration-200
                    ${isSelected
                      ? 'border-[#D4A017] bg-[#D4A017]/10 shadow-[0_0_10px_rgba(212,160,23,0.18)]'
                      : 'border-white/10 bg-[#1A1A1A] hover:border-[#D4A017]/40'
                    }`}
                >
                  {/* Selection badge */}
                  <span
                    className={`absolute top-2 right-2 flex items-center justify-center w-4 h-4 rounded-full border transition-colors ${
                      isSelected
                        ? 'bg-[#D4A017] border-[#D4A017]'
                        : 'bg-transparent border-white/30'
                    }`}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5 text-black" strokeWidth={3} />}
                  </span>

                  {/* Icon or image */}
                  <div className="w-14 h-14 rounded-lg bg-[#2A2A2A] flex items-center justify-center overflow-hidden">
                    {addon.image_url ? (
                      <img
                        src={addon.image_url}
                        alt={addon.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-2xl" role="img" aria-label={addon.name}>
                        {addon.emoji ?? '✨'}
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-semibold text-white text-center leading-snug w-full">
                    {addon.name}
                  </span>
                  <span className="text-xs font-bold text-[#D4A017]">
                    +{formatCurrency(addon.price)}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ))}

      {/* Running total */}
      {selectedAddonIds.length > 0 && (
        <div className="sticky bottom-0 flex items-center justify-between px-5 py-3 rounded-xl
                        bg-[#1A1A1A] border border-[#D4A017]/30 shadow-lg shadow-black/40">
          <span className="text-sm text-gray-300">
            {selectedAddonIds.length} add-on{selectedAddonIds.length !== 1 ? 's' : ''} selected
          </span>
          <span className="text-sm font-bold text-[#D4A017]">
            +{formatCurrency(selectedTotal)}
          </span>
        </div>
      )}

      {addons.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-6">No add-ons available for this theater.</p>
      )}
    </div>
  );
}
