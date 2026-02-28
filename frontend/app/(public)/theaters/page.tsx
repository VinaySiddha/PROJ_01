/**
 * @file Theaters listing page — shows all available theaters, filterable by location
 * @module app/(public)/theaters/page
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import type { Theater, Location } from '@/types/theater';

export const metadata: Metadata = {
  title: 'Private Theaters in Hyderabad',
  description:
    'Browse all private theaters available for booking in Hyderabad at Hitec City and Miyapur locations.',
};

/** Fetch theaters from API (server-side, with optional location filter) */
async function fetchTheaters(location?: string): Promise<Theater[]> {
  const apiUrl = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api';
  const url = location ? `${apiUrl}/theaters?location=${location}` : `${apiUrl}/theaters`;
  try {
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = (await res.json()) as { data?: Theater[] };
    return data.data ?? [];
  } catch {
    return [];
  }
}

/** Fetch all distinct locations for filter tabs */
async function fetchLocations(): Promise<Location[]> {
  const apiUrl = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api';
  try {
    const res = await fetch(`${apiUrl}/theaters/locations`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = (await res.json()) as { data?: Location[] };
    return data.data ?? [];
  } catch {
    return [];
  }
}

interface TheatersPageProps {
  searchParams: Promise<{ location?: string }>;
}

export default async function TheatersPage({ searchParams }: TheatersPageProps) {
  const { location } = await searchParams;
  const [theaters, locations] = await Promise.all([fetchTheaters(location), fetchLocations()]);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Our Private Theaters
          </h1>
          <p className="text-[#888] text-lg max-w-xl mx-auto">
            Handcrafted private cinema experiences for every occasion.
          </p>
        </div>

        {/* Location Filter Tabs */}
        <div className="flex items-center justify-center gap-3 mb-10 flex-wrap">
          <Link
            href="/theaters"
            className={`flex items-center gap-2 px-5 py-2 rounded-full border transition-all text-sm font-medium ${
              !location
                ? 'bg-[#D4A017] text-black border-[#D4A017]'
                : 'border-white/20 text-[#888] hover:border-[#D4A017]/50 hover:text-white'
            }`}
          >
            All Locations
          </Link>
          {locations.map((loc) => (
            <Link
              key={loc.slug}
              href={`/theaters?location=${loc.slug}`}
              className={`flex items-center gap-2 px-5 py-2 rounded-full border transition-all text-sm font-medium ${
                location === loc.slug
                  ? 'bg-[#D4A017] text-black border-[#D4A017]'
                  : 'border-white/20 text-[#888] hover:border-[#D4A017]/50 hover:text-white'
              }`}
            >
              <MapPin size={14} /> {loc.name}
            </Link>
          ))}
        </div>

        {/* Theater Grid */}
        {theaters.length === 0 ? (
          <div className="text-center py-16 text-[#888]">
            <p className="text-lg">No theaters found. Please try a different location.</p>
            <Link
              href="/theaters"
              className="inline-flex items-center gap-2 mt-4 px-5 py-2 border border-[#D4A017]/40 text-[#D4A017] rounded-full text-sm hover:bg-[#D4A017]/10 transition-colors"
            >
              View All Locations
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {theaters.map((theater) => (
              <Link
                key={theater.id}
                href={`/theaters/${theater.id}`}
                className="group block"
              >
                <div className="rounded-2xl border border-white/10 bg-[#1A1A1A] overflow-hidden hover:border-[#D4A017]/50 transition-all hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(212,160,23,0.12)]">
                  {/* Placeholder image area */}
                  <div className="aspect-video bg-[#2A2A2A] flex items-center justify-center relative overflow-hidden">
                    <span className="text-5xl">🎬</span>
                    {theater.couple_only && (
                      <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D4A017] text-black uppercase tracking-wider">
                        Couple Only
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <h3
                      className="font-semibold text-white text-lg mb-1 group-hover:text-[#D4A017] transition-colors"
                      style={{ fontFamily: 'var(--font-playfair)' }}
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
        )}
      </div>
    </div>
  );
}
