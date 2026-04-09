/**
 * @file BookingSummaryCard.tsx
 * @description Full booking price breakdown summary card for the final step
 * of the The Magic Screen booking flow. Server Component — purely presentational.
 */

import { CalendarDays, Clock, Building2, Minus } from 'lucide-react';
import type { PriceBreakdown } from '@/types/booking';
import { formatCurrency } from '@/lib/formatters';

interface BookingSummaryCardProps {
  /** Structured price breakdown from the booking engine. */
  breakdown: PriceBreakdown;
  /** Display name of the selected theater. */
  theaterName: string;
  /** Human-readable booking date (e.g. "Saturday, 1 March 2026"). */
  date: string;
  /** Name of the selected time slot (e.g. "Evening"). */
  slotName: string;
}

interface SummaryRowProps {
  label: string;
  value: string;
  isDiscount?: boolean;
  isMuted?: boolean;
  isBold?: boolean;
}

/** Single row in the price breakdown table. */
function SummaryRow({ label, value, isDiscount, isMuted, isBold }: Readonly<SummaryRowProps>) {
  let valueClass = 'text-white';
  if (isDiscount) {
    valueClass = 'text-green-400';
  } else if (isBold) {
    valueClass = 'text-white font-bold text-base';
  }

  return (
    <div className="flex items-start justify-between gap-3 py-2.5 border-b border-white/8 last:border-0">
      <span className={`flex-1 pr-2 text-xs sm:text-sm leading-5 ${isMuted ? 'text-gray-500' : 'text-gray-300'}`}>{label}</span>
      <span className={`shrink-0 text-right text-xs sm:text-sm font-medium ${valueClass}`}>
        {isDiscount ? `− ${value}` : value}
      </span>
    </div>
  );
}

/**
 * Complete booking summary and price breakdown card.
 * Shown on the final "Summary" step before payment.
 * Highlights the advance amount due now and balance on arrival.
 */
export function BookingSummaryCard({
  breakdown,
  theaterName,
  date,
  slotName,
}: Readonly<BookingSummaryCardProps>) {
  const ADVANCE_AMOUNT = 700;
  const balanceOnArrival = breakdown.total - ADVANCE_AMOUNT;
  const couponLabel = breakdown.coupon_code
    ? `Coupon (${breakdown.coupon_code})`
    : 'Coupon Discount';

  return (
    <div className="rounded-xl bg-[#1A1A1A] border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-[#D4A017]/8 border-b border-[#D4A017]/20">
        <h3 className="text-sm font-semibold text-[#D4A017] uppercase tracking-wider">
          Booking Summary
        </h3>
        <div className="mt-2 flex flex-wrap gap-3">
          <span className="flex items-center gap-1.5 text-xs text-gray-300">
            <Building2 className="w-3.5 h-3.5 text-[#D4A017]" />
            {theaterName}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-300">
            <CalendarDays className="w-3.5 h-3.5 text-[#D4A017]" />
            {date}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-300">
            <Clock className="w-3.5 h-3.5 text-[#D4A017]" />
            {slotName}
          </span>
        </div>
      </div>

      {/* Price rows */}
      <div className="px-5 py-1">
        <SummaryRow label="Base Price" value={formatCurrency(breakdown.base_price)} />

        {breakdown.extra_persons_charge > 0 && (
          <SummaryRow
            label={`Extra guests (${breakdown.extra_adults ?? 0} adults, ${breakdown.extra_children ?? 0} children)`}
            value={formatCurrency(breakdown.extra_persons_charge)}
          />
        )}
        {breakdown.addons_total > 0 && (
          <SummaryRow label="Add-ons" value={formatCurrency(breakdown.addons_total)} />
        )}
        {breakdown.cake_price > 0 && (
          <SummaryRow label="Cake" value={formatCurrency(breakdown.cake_price)} />
        )}
        {breakdown.food_total > 0 && (
          <SummaryRow label="Food" value={formatCurrency(breakdown.food_total)} />
        )}
        {breakdown.coupon_discount > 0 && (
          <SummaryRow
            label={couponLabel}
            value={formatCurrency(breakdown.coupon_discount)}
            isDiscount
          />
        )}
      </div>

      {/* Divider */}
      <div className="mx-5 my-1 h-px bg-white/15" />

      {/* Total */}
      <div className="px-5 py-2">
        <SummaryRow label="Total Amount" value={formatCurrency(breakdown.total)} isBold />
      </div>

      {/* Payment split — highlighted section */}
      <div className="mx-3 sm:mx-4 mb-4 rounded-lg bg-[#D4A017]/8 border border-[#D4A017]/25 p-3 sm:p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-white">Advance (Pay Now)</span>
          <span className="text-base font-bold text-[#D4A017]">{formatCurrency(ADVANCE_AMOUNT)}</span>
        </div>
        <div className="flex items-center justify-between text-gray-400">
          <span className="flex items-center gap-1 text-sm">
            <Minus className="w-3 h-3" />
            Balance on Arrival
          </span>
          <span className="text-sm font-medium text-gray-300">{formatCurrency(balanceOnArrival)}</span>
        </div>
      </div>
    </div>
  );
}
