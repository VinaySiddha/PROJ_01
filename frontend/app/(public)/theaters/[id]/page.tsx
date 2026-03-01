/**
 * @file Theater detail page — full info, gallery, pricing, available slots, reviews
 * @module app/(public)/theaters/[id]/page
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Monitor, Volume2, Users, Clock, ChevronRight, MapPin } from 'lucide-react';
import type { Theater } from '@/types/theater';

interface Params {
  params: Promise<{ id: string }>;
}

async function fetchTheater(id: string): Promise<Theater | null> {
  const apiUrl = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api';
  try {
    const res = await fetch(`${apiUrl}/theaters/${id}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const data = (await res.json()) as { data?: Theater };
    return data.data ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const theater = await fetchTheater(id);
  if (!theater) return { title: 'Theater Not Found' };
  return {
    title: `${theater.name} — Private Theater in Hyderabad`,
    description: `Book ${theater.name} for a private screening experience. ${theater.screen_size} ${theater.screen_resolution} screen, ${theater.sound_system} sound. Base price ₹${theater.base_price}.`,
  };
}

export default async function TheaterDetailPage({ params }: Params) {
  const { id } = await params;
  const theater = await fetchTheater(id);
  if (!theater) notFound();

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[#888] mb-8" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight size={14} />
          <Link href="/theaters" className="hover:text-white transition-colors">
            Theaters
          </Link>
          <ChevronRight size={14} />
          <span className="text-white">{theater.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left: Theater info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery placeholder */}
            <div className="aspect-video bg-[#1A1A1A] rounded-2xl border border-white/10 flex items-center justify-center">
              <span className="text-6xl">🎬</span>
            </div>

            {/* Name + location */}
            <div>
              {theater.location && (
                <div className="flex items-center gap-2 text-sm text-[#888] mb-2">
                  <MapPin size={14} className="text-[#D4A017]" />
                  <span>{theater.location.name}</span>
                </div>
              )}
              <h1
                className="text-3xl md:text-4xl font-bold text-white"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {theater.name}
              </h1>
              {theater.couple_only && (
                <span className="inline-block mt-2 px-3 py-1 bg-pink-500/15 text-pink-400 border border-pink-500/30 rounded-full text-xs">
                  Couples Only
                </span>
              )}
            </div>

            {/* Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                {
                  icon: Monitor,
                  label: 'Screen',
                  value: `${theater.screen_size} ${theater.screen_resolution}`,
                },
                { icon: Volume2, label: 'Sound', value: theater.sound_system },
                { icon: Users, label: 'Capacity', value: `Up to ${theater.max_capacity} guests` },
                { icon: Clock, label: 'Duration', value: '1.5hr or 2.5hr' },
              ].map((spec) => (
                <div
                  key={spec.label}
                  className="p-4 rounded-xl border border-white/10 bg-[#1A1A1A]"
                >
                  <spec.icon size={18} className="text-[#D4A017] mb-2" />
                  <p className="text-xs text-[#888]">{spec.label}</p>
                  <p className="text-sm font-medium text-white mt-0.5">{spec.value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            {theater.description && (
              <div>
                <h2
                  className="text-xl font-bold text-white mb-3"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  About This Theater
                </h2>
                <p className="text-[#888] leading-relaxed">{theater.description}</p>
              </div>
            )}

            {/* What's Included */}
            <div>
              <h2
                className="text-xl font-bold text-white mb-4"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                What&apos;s Included
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  'Private theater exclusively for you',
                  'Free base decoration setup',
                  'High-speed Wi-Fi',
                  'Access to all streaming platforms',
                  'Complimentary welcome setup',
                  'Air-conditioned comfort',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-[#888]">
                    <span className="text-[#D4A017] text-base">&#10003;</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Booking card */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 p-6 rounded-2xl border border-[#D4A017]/30 bg-[#1A1A1A] space-y-4">
              <h3
                className="text-lg font-bold text-white"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Book This Theater
              </h3>

              {/* Pricing */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-[#888]">
                  <span>
                    Standard (2.5 hrs, {theater.base_capacity} guests)
                  </span>
                  <span className="text-white font-semibold">
                    &#8377;{theater.base_price.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-[#888]">
                  <span>
                    Short (1.5 hrs, {theater.base_capacity} guests)
                  </span>
                  <span className="text-white font-semibold">
                    &#8377;{theater.short_slot_price.toLocaleString('en-IN')}
                  </span>
                </div>
                {theater.allow_extra_persons && (
                  <>
                    <div className="flex justify-between text-[#888]">
                      <span>Extra adult</span>
                      <span className="text-white">
                        +&#8377;{theater.extra_adult_price.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between text-[#888]">
                      <span>Extra child (3&ndash;12 yrs)</span>
                      <span className="text-white">
                        +&#8377;{theater.extra_child_price.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="border-t border-white/10 pt-3 text-xs text-[#888]">
                Advance payment:{' '}
                <span className="text-[#D4A017] font-semibold">&#8377;700</span> to confirm booking.
                Remaining balance paid at venue.
              </div>

              <Link
                href={`/theaters/${theater.id}/book`}
                className="block w-full text-center py-3.5 bg-[#D4A017] text-black font-bold rounded-xl hover:bg-[#D4A017]/90 transition-all hover:scale-[1.02]"
              >
                Book Now
              </Link>

              <p className="text-xs text-center text-[#888]">
                Free cancellation up to 72 hours before your slot
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
