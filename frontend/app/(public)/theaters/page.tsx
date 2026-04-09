/**
 * @file Theaters listing page — shows all Bhadurpally private theaters
 * @module app/(public)/theaters/page
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import type { Theater } from '@/types/theater';

export const metadata: Metadata = {
  title: 'Private Theaters in Bhadurpally, Hyderabad',
  description:
    'Browse our private theaters available for booking in Bhadurpally, Hyderabad. Perfect for birthdays, anniversaries, and special celebrations.',
};

type TheatersResult = {
  theaters: Theater[];
  hasFetchError: boolean;
};

/**
 * Fetch theaters from API (server-side).
 * Uses no-store to avoid caching an accidental empty response when backend is down.
 */
async function fetchTheaters(): Promise<TheatersResult> {
  const rawApiUrl = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api';
  const apiUrl = rawApiUrl.replace(/\/$/, '');

  try {
    const res = await fetch(`${apiUrl}/theaters`, { cache: 'no-store' });
    if (!res.ok) {
      return { theaters: [], hasFetchError: true };
    }

    const payload = (await res.json()) as {
      data?: Theater[] | { items?: Theater[] };
    };

    if (Array.isArray(payload.data)) {
      return { theaters: payload.data, hasFetchError: false };
    }

    const nestedItems = payload.data && typeof payload.data === 'object'
      ? payload.data.items
      : undefined;

    return {
      theaters: Array.isArray(nestedItems) ? nestedItems : [],
      hasFetchError: false,
    };
  } catch {
    return { theaters: [], hasFetchError: true };
  }
}

export default async function TheatersPage() {
  const { theaters, hasFetchError } = await fetchTheaters();

  let content: React.ReactNode;
  if (hasFetchError) {
    content = (
      <div className="text-center py-16 text-[#888]">
        <p className="text-lg text-red-400">Unable to load theaters right now.</p>
        <p className="text-sm mt-2">Please ensure the backend API is running and try again.</p>
      </div>
    );
  } else if (theaters.length === 0) {
    content = (
      <div className="text-center py-16 text-[#888]">
        <p className="text-lg">No theaters available at the moment. Please check back soon.</p>
      </div>
    );
  } else {
    content = (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {theaters.map((theater) => (
          <Link
            key={theater.id}
            href={`/theaters/${theater.id}`}
            className="group block"
          >
            <div className="rounded-2xl border border-white/10 bg-[#1A1A1A] overflow-hidden hover:border-[#D4A017]/50 transition-all hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(212,160,23,0.12)]">
              {/* Theater image */}
              <div className="aspect-video bg-[#2A2A2A] relative overflow-hidden">
                {theater.images?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={theater.images[0]}
                    alt={theater.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A]">
                    <span className="text-5xl opacity-30">🎬</span>
                  </div>
                )}
                {theater.couple_only && (
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D4A017] text-black uppercase tracking-wider">
                    Couple Only
                  </span>
                )}
              </div>
              <div className="p-5">
                <h3
                  className="font-semibold text-white text-lg mb-1 group-hover:text-[#D4A017] transition-colors"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {theater.name}
                </h3>
                <p className="text-sm text-[#888] mb-3">
                  {theater.screen_size} &bull; {theater.screen_resolution}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-[#D4A017] font-bold text-lg">
                    &#8377;{theater.base_price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-[#888]">
                    for {theater.base_capacity} guests
                  </span>
                </div>
                {theater.average_rating != null && theater.average_rating > 0 && (
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-[#D4A017] text-xs">&#9733;</span>
                    <span className="text-xs text-[#888]">
                      {theater.average_rating.toFixed(1)}
                      {theater.review_count != null && theater.review_count > 0 && (
                        <> ({theater.review_count})</>
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Our Private Theaters
          </h1>
          <p className="text-[#888] text-lg max-w-xl mx-auto">
            Handcrafted private cinema experiences for every occasion.
          </p>
          <div className="flex items-center justify-center gap-2 mt-3 text-sm text-[#D4A017]">
            <MapPin size={14} />
            <span>Bhadurpally, Hyderabad</span>
          </div>
        </div>

        {/* Theater Grid */}
        {content}
      </div>
    </div>
  );
}
