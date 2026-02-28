/**
 * @file TheaterSpecs.tsx
 * @description Displays detailed technical specifications and pricing for a theater.
 * Server Component — pure data display, no interactivity.
 */

import { Monitor, Volume2, Users, Tag } from 'lucide-react';
import type { Theater } from '@/types/theater';
import { formatCurrency } from '@/lib/formatters';

interface TheaterSpecsProps {
  /** Full theater object containing specs and pricing data. */
  theater: Theater;
}

interface SpecRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

/** Single specification row with icon, label, and value. */
function SpecRow({ icon, label, value }: SpecRowProps) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/8 last:border-0">
      <span className="shrink-0 flex items-center justify-center w-8 h-8 rounded-md bg-[#D4A017]/10 text-[#D4A017]">
        {icon}
      </span>
      <span className="text-sm text-gray-400 w-32 shrink-0">{label}</span>
      <span className="text-sm text-white font-medium">{value}</span>
    </div>
  );
}

interface PriceRowProps {
  label: string;
  value: string;
  highlighted?: boolean;
}

/** Single pricing table row. */
function PriceRow({ label, value, highlighted = false }: PriceRowProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/8 last:border-0">
      <span className="text-sm text-gray-400">{label}</span>
      <span className={`text-sm font-semibold ${highlighted ? 'text-[#D4A017]' : 'text-white'}`}>
        {value}
      </span>
    </div>
  );
}

/**
 * Theater technical specifications and pricing breakdown card.
 * Renders screen, sound, and capacity specs alongside the full pricing table.
 */
export function TheaterSpecs({ theater }: TheaterSpecsProps) {
  return (
    <section className="flex flex-col gap-6">
      {/* Technical Specs */}
      <div className="rounded-xl bg-[#1A1A1A] border border-white/10 p-5">
        <h3 className="text-sm font-semibold text-[#D4A017] uppercase tracking-wider mb-1">
          Technical Specifications
        </h3>
        <div className="mt-2">
          <SpecRow
            icon={<Monitor className="w-4 h-4" />}
            label="Screen"
            value={`${theater.screen_size}${theater.resolution ? ` · ${theater.resolution}` : ''}`}
          />
          <SpecRow
            icon={<Volume2 className="w-4 h-4" />}
            label="Sound System"
            value={theater.sound_system}
          />
          <SpecRow
            icon={<Users className="w-4 h-4" />}
            label="Capacity"
            value={`Up to ${theater.max_capacity} guests (${theater.base_capacity} included)`}
          />
        </div>
      </div>

      {/* Pricing */}
      <div className="rounded-xl bg-[#1A1A1A] border border-white/10 p-5">
        <h3 className="text-sm font-semibold text-[#D4A017] uppercase tracking-wider mb-1">
          Pricing
        </h3>
        <div className="mt-2">
          <PriceRow
            label={`Base Price (${theater.base_capacity} guests · 2.5 hrs)`}
            value={formatCurrency(theater.base_price)}
            highlighted
          />
          {theater.short_slot_price != null && (
            <PriceRow
              label="Short Slot (1.5 hrs)"
              value={formatCurrency(theater.short_slot_price)}
            />
          )}
          {theater.extra_adult_price != null && (
            <PriceRow
              label="Extra Adult (per person)"
              value={`+ ${formatCurrency(theater.extra_adult_price)}`}
            />
          )}
          {theater.extra_child_price != null && (
            <PriceRow
              label="Extra Child (per person)"
              value={`+ ${formatCurrency(theater.extra_child_price)}`}
            />
          )}
        </div>

        <p className="mt-3 text-xs text-gray-500 flex items-start gap-1">
          <Tag className="w-3 h-3 mt-0.5 shrink-0 text-[#D4A017]" />
          Advance of <span className="text-[#D4A017] font-medium mx-1">₹700</span> required to confirm booking. Balance payable on arrival.
        </p>
      </div>
    </section>
  );
}
