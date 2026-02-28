/**
 * @file TheaterCard.tsx
 * @description Card component displaying a single theater's preview for CineNest.
 * Client Component — handles the Book Now click and image interactions.
 */

'use client';

import Image from 'next/image';
import { Monitor, Volume2, Users, Star, Tag } from 'lucide-react';
import type { Theater } from '@/types/theater';
import { formatCurrency } from '@/lib/formatters';

interface TheaterCardProps {
  /** The theater data object to display. */
  theater: Theater;
  /** Optional callback fired when the user clicks "Book Now". */
  onSelect?: (id: string) => void;
}

/**
 * Theater listing card.
 * Shows the theater image, badge for couple-only theaters, name, location,
 * technical specs, pricing, star rating, and a Book Now CTA.
 */
export function TheaterCard({ theater, onSelect }: TheaterCardProps) {
  const handleBook = () => {
    if (onSelect) {
      onSelect(theater.id);
    }
  };

  return (
    <article className="group flex flex-col rounded-xl bg-[#1A1A1A] border border-white/10
                        hover:border-[#D4A017]/60 transition-all duration-300 overflow-hidden shadow-md hover:shadow-[#D4A017]/10 hover:shadow-lg">
      {/* Image */}
      <div className="relative w-full aspect-video overflow-hidden">
        <Image
          src={theater.image_url ?? '/images/theater-placeholder.jpg'}
          alt={theater.name}
          fill
          priority={false}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Couple-only badge */}
        {theater.couple_only && (
          <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold
                           bg-[#D4A017] text-black uppercase tracking-wider shadow">
            Couple Only
          </span>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/60 via-transparent to-transparent" />
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Name + location */}
        <div>
          <h3 className="text-base font-semibold text-white leading-snug" style={{ fontFamily: "'Playfair Display', serif" }}>
            {theater.name}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">{theater.location_name}</p>
        </div>

        {/* Specs row */}
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Monitor className="w-3.5 h-3.5 text-[#D4A017]" />
            {theater.screen_size}
          </span>
          <span className="flex items-center gap-1">
            <Volume2 className="w-3.5 h-3.5 text-[#D4A017]" />
            {theater.sound_system}
          </span>
        </div>

        {/* Capacity + price */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Users className="w-3.5 h-3.5 text-[#D4A017]" />
            Up to {theater.max_capacity} guests
          </span>
          <span className="flex items-center gap-1 text-sm font-semibold text-[#D4A017]">
            <Tag className="w-3 h-3" />
            {formatCurrency(theater.base_price)}
          </span>
        </div>

        {/* Star rating */}
        {theater.average_rating != null && theater.average_rating > 0 && (
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${i < Math.round(theater.average_rating!) ? 'text-[#D4A017] fill-[#D4A017]' : 'text-gray-600'}`}
              />
            ))}
            <span className="text-xs text-gray-400 ml-1">
              {theater.average_rating.toFixed(1)} ({theater.review_count ?? 0})
            </span>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="px-4 pb-4">
        <button
          type="button"
          onClick={handleBook}
          className="w-full py-2.5 rounded-md bg-[#D4A017] text-black text-sm font-semibold
                     hover:bg-[#e6b120] active:scale-[0.98] transition-all duration-200"
        >
          Book Now
        </button>
      </div>
    </article>
  );
}
