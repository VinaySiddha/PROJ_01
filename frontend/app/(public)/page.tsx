/**
 * @file Home page — The Magic Screen landing page with hero, features, theaters preview, and reviews
 * @module app/(public)/page
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { Star, MapPin, Clock, Shield, ChevronRight, Play } from 'lucide-react';

export const metadata: Metadata = {
  title: 'The Magic Screen — Private Theater Booking in Hyderabad',
  description:
    'Book a private theater in Bhadurpally, Hyderabad for birthdays, anniversaries, date nights and more. Premium private cinema experiences.',
};

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      {/* ── Hero Section ─────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center justify-center">
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#D4A017]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#D4A017]/30 bg-[#D4A017]/5 text-[#D4A017] text-sm font-medium mb-8">
            <Star size={14} fill="currentColor" />
            <span>Hyderabad&apos;s Premier Private Theater Experience</span>
          </div>

          {/* Headline */}
          <h1
            className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Your Story Deserves a{' '}
            <span className="text-[#D4A017]">Grand Stage</span>
          </h1>

          <p className="text-xl text-[#888] max-w-2xl mx-auto mb-10 leading-relaxed">
            Private theater experiences for birthdays, anniversaries, proposals, and every moment worth
            celebrating. Fully private. Fully yours.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/theaters"
              className="flex items-center gap-2 px-8 py-4 bg-[#D4A017] text-black font-bold text-lg rounded-2xl hover:bg-[#D4A017]/90 transition-all hover:scale-105 shadow-[0_0_30px_rgba(212,160,23,0.3)]"
            >
              Book Your Experience <ChevronRight size={20} />
            </Link>
            <Link
              href="/gallery"
              className="flex items-center gap-2 px-8 py-4 border border-white/20 text-white font-semibold text-lg rounded-2xl hover:bg-white/5 transition-all"
            >
              <Play size={20} className="text-[#D4A017]" /> View Gallery
            </Link>
          </div>

          {/* Social proof numbers */}
          <div className="flex items-center justify-center gap-8 mt-14 pt-8 border-t border-white/10">
            {[
              { value: '2000+', label: 'Happy Celebrations' },
              { value: '4.9★', label: 'Average Rating' },
              { value: '4', label: 'Private Theaters' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-[#D4A017]">{stat.value}</p>
                <p className="text-xs text-[#888] mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ──────────────────────────────────────────── */}
      <section className="py-20 bg-[#0D0D0D]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Why The Magic Screen?
            </h2>
            <p className="text-[#888] max-w-lg mx-auto">
              Everything you need for an unforgettable private screening experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: 'Fully Private',
                desc: 'No strangers, no interruptions. The entire theater is exclusively yours.',
              },
              {
                icon: Star,
                title: 'Premium Setup',
                desc: 'Luxury recliner seats, 4K screen, Dolby Atmos sound, and customizable decor.',
              },
              {
                icon: Clock,
                title: 'Flexible Slots',
                desc: 'Morning to midnight slots, 1.5hr or 2.5hr sessions. Book any day.',
              },
              {
                icon: MapPin,
                title: 'Bhadurpally',
                desc: 'Conveniently located in Bhadurpally — easily accessible from across Hyderabad.',
              },
              {
                icon: Star,
                title: 'Free Decorations',
                desc: 'Complimentary base decoration for all occasions. Upgrade available.',
              },
              {
                icon: Clock,
                title: 'Instant Confirmation',
                desc: 'WhatsApp confirmation immediately after booking. No waiting.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl border border-white/10 bg-[#1A1A1A] hover:border-[#D4A017]/40 transition-all group"
              >
                <div className="w-11 h-11 rounded-xl bg-[#D4A017]/10 flex items-center justify-center mb-4 group-hover:bg-[#D4A017]/20 transition-colors">
                  <feature.icon size={20} className="text-[#D4A017]" />
                </div>
                <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-[#888] text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Occasions ──────────────────────────────────────────────── */}
      <section className="py-20 bg-[#111]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Every Celebration,{' '}
              <span className="text-[#D4A017]">Perfectly Framed</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { emoji: '🎂', label: 'Birthday' },
              { emoji: '💑', label: 'Anniversary' },
              { emoji: '💍', label: 'Proposal' },
              { emoji: '🎀', label: 'Bride to Be' },
              { emoji: '👶', label: 'Baby Shower' },
              { emoji: '🌙', label: 'Date Night' },
              { emoji: '🎓', label: 'Farewell' },
              { emoji: '🥳', label: 'Reunion' },
              { emoji: '🎬', label: 'Movie Night' },
              { emoji: '💼', label: 'Corporate' },
            ].map((occ) => (
              <Link
                key={occ.label}
                href="/theaters"
                className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-white/10 bg-[#1A1A1A] hover:border-[#D4A017]/50 hover:bg-[#D4A017]/5 transition-all text-center group"
              >
                <span className="text-3xl">{occ.emoji}</span>
                <span className="text-sm font-medium text-[#ccc] group-hover:text-[#D4A017] transition-colors">
                  {occ.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Location CTA ───────────────────────────────────────────── */}
      <section className="py-20 bg-[#0D0D0D]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2
            className="text-3xl md:text-4xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Now Open in Bhadurpally
          </h2>
          <p className="text-[#888] mb-10">
            Visit us at Bhadurpally, Hyderabad — easily accessible and ready to host your celebration.
          </p>
          <Link
            href="/theaters"
            className="inline-flex items-center justify-between p-6 rounded-2xl border border-white/10 bg-[#1A1A1A] hover:border-[#D4A017]/50 transition-all group max-w-sm mx-auto"
          >
            <div className="text-left">
              <div className="flex items-center gap-2 mb-1">
                <MapPin size={16} className="text-[#D4A017]" />
                <span className="font-semibold text-white">Bhadurpally</span>
              </div>
              <p className="text-sm text-[#888]">4 private theaters available</p>
            </div>
            <ChevronRight
              size={20}
              className="text-[#D4A017] group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────── */}
      <section className="py-24 bg-[#111] text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2
            className="text-3xl md:text-4xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Ready to Create a Memory?
          </h2>
          <p className="text-[#888] mb-8">Slots fill up fast on weekends. Book yours now.</p>
          <Link
            href="/theaters"
            className="inline-flex items-center gap-2 px-10 py-4 bg-[#D4A017] text-black font-bold text-lg rounded-2xl hover:bg-[#D4A017]/90 transition-all hover:scale-105 shadow-[0_0_40px_rgba(212,160,23,0.3)]"
          >
            Browse Theaters <ChevronRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
