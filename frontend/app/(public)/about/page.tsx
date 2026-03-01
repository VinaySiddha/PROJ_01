/**
 * @file About Us page
 * @module app/(public)/about/page
 */
import type { Metadata } from 'next';
import { Heart, Award, Users, MapPin } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    "Learn about The Magic Screen — Hyderabad's premier private theater booking platform for celebrations and special moments.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            About <span className="text-[#D4A017]">The Magic Screen</span>
          </h1>
          <p className="text-[#888] text-lg max-w-xl mx-auto leading-relaxed">
            We believe every special moment deserves a special setting. We created The Magic Screen to give
            Hyderabad a world-class private cinema experience that&apos;s accessible to everyone.
          </p>
        </div>

        {/* Story */}
        <div className="prose-cinema mb-16">
          <p className="text-[#888] leading-relaxed mb-4">
            The Magic Screen was born from a simple idea: what if you could have an entire cinema hall to
            yourself? No strangers, no phones ringing, no crying babies &mdash; just you, your
            loved ones, and a movie on a massive screen.
          </p>
          <p className="text-[#888] leading-relaxed mb-4">
            We started with one theater in Hitec City and quickly realized how much demand there
            was for private, personalized celebration experiences. Today we operate multiple premium
            private theaters across Hyderabad, having hosted over 2,000 celebrations.
          </p>
          <p className="text-[#888] leading-relaxed">
            Every booking with us is handled with care &mdash; from the personalized decoration
            setup to the instant WhatsApp confirmation. We don&apos;t just rent screens; we craft
            memories.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {[
            { icon: Heart, value: '2000+', label: 'Happy Celebrations' },
            { icon: Award, value: '4.9', label: 'Average Rating' },
            { icon: Users, value: '10000+', label: 'Guests Hosted' },
            { icon: MapPin, value: '2', label: 'Locations' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-6 rounded-2xl border border-white/10 bg-[#1A1A1A] text-center"
            >
              <stat.icon size={24} className="text-[#D4A017] mx-auto mb-3" />
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-[#888] mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2
            className="text-2xl font-bold text-white mb-8 text-center"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Privacy First',
                desc: 'Your celebration is yours alone. We ensure complete privacy and exclusivity for every booking.',
              },
              {
                title: 'Premium Quality',
                desc: 'Best-in-class screens, sound systems, and seating comfort — nothing is compromised.',
              },
              {
                title: 'Memorable Experiences',
                desc: 'Every detail is crafted to make your occasion unforgettable from start to finish.',
              },
            ].map((v) => (
              <div
                key={v.title}
                className="p-6 rounded-2xl border border-white/10 bg-[#1A1A1A] hover:border-[#D4A017]/40 transition-all"
              >
                <h3 className="font-semibold text-[#D4A017] mb-2">{v.title}</h3>
                <p className="text-sm text-[#888] leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Locations */}
        <div>
          <h2
            className="text-2xl font-bold text-white mb-8 text-center"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Our Locations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                name: 'Hitec City',
                address: 'HUDA Techno Enclave, Madhapur, Hyderabad &ndash; 500081',
                timing: '9:00 AM &ndash; 1:00 AM, Every Day',
              },
              {
                name: 'Miyapur',
                address: 'Miyapur Metro Station Road, Miyapur, Hyderabad &ndash; 500049',
                timing: '9:00 AM &ndash; 1:00 AM, Every Day',
              },
            ].map((loc) => (
              <div
                key={loc.name}
                className="p-6 rounded-2xl border border-white/10 bg-[#1A1A1A]"
              >
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={16} className="text-[#D4A017]" />
                  <h3 className="font-semibold text-white">{loc.name}</h3>
                </div>
                <p
                  className="text-sm text-[#888] mb-1"
                  dangerouslySetInnerHTML={{ __html: loc.address }}
                />
                <p
                  className="text-xs text-[#888]"
                  dangerouslySetInnerHTML={{ __html: loc.timing }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
