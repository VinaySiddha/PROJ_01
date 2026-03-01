/**
 * @file Contact page — pulls all contact info dynamically from site settings
 * @module app/(public)/contact/page
 */
import type { Metadata } from 'next';
import { Phone, Mail, MapPin, MessageCircle, Clock, Instagram, Youtube, Facebook } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact Us — The Magic Screen',
  description:
    'Get in touch with The Magic Screen. Contact us via WhatsApp, email, or visit our theaters in Bhadurpally, Hyderabad.',
};

async function fetchSettings(): Promise<Record<string, string>> {
  const apiUrl = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api';
  try {
    const res = await fetch(`${apiUrl}/settings`, { next: { revalidate: 120 } });
    if (!res.ok) return {};
    const data = (await res.json()) as { data?: Record<string, string> };
    return data.data ?? {};
  } catch {
    return {};
  }
}

export default async function ContactPage() {
  const s = await fetchSettings();

  const phone      = s['support_phone'] ?? '+919999999999';
  const email      = s['support_email'] ?? 'hello@themagicscreen.in';
  const waNumber   = (s['whatsapp_number'] ?? '919999999999').replace(/\D/g, '');
  const address    = s['address'] ?? 'Bhadurpally, Hyderabad, Telangana 500055';
  const hours      = s['working_hours'] ?? '9:00 AM – 1:00 AM, Every Day';
  const mapsUrl    = s['google_maps_url'] ?? `https://maps.google.com/?q=${encodeURIComponent(address)}`;
  const instagram  = s['instagram_url'];
  const youtube    = s['youtube_url'];
  const facebook   = s['facebook_url'];

  const waLink = `https://wa.me/${waNumber}?text=Hi%20I%20need%20help%20with%20a%20The%20Magic%20Screen%20booking`;
  const phoneDisplay = phone.startsWith('+91') ? phone : `+91 ${phone.slice(-10)}`;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Contact <span className="text-[#D4A017]">Us</span>
          </h1>
          <p className="text-[#888] text-lg max-w-xl mx-auto">
            Have questions? We&apos;re here to help. Reach us via WhatsApp for the fastest response.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Methods */}
          <div className="space-y-4">
            <h2
              className="text-xl font-bold text-white mb-4"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Get in Touch
            </h2>

            {/* WhatsApp */}
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-6 rounded-2xl border border-green-500/30 bg-green-500/5 hover:bg-green-500/10 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <MessageCircle size={22} className="text-green-400" />
              </div>
              <div>
                <p className="font-semibold text-white">WhatsApp (Fastest)</p>
                <p className="text-sm text-[#888]">{phoneDisplay} &mdash; Replies within minutes</p>
                <p className="text-xs text-green-400 mt-1">Tap to open WhatsApp &#8594;</p>
              </div>
            </a>

            {/* Phone */}
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-4 p-6 rounded-2xl border border-white/10 bg-[#1A1A1A] hover:border-[#D4A017]/40 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-[#D4A017]/10 flex items-center justify-center flex-shrink-0">
                <Phone size={22} className="text-[#D4A017]" />
              </div>
              <div>
                <p className="font-semibold text-white">Phone</p>
                <p className="text-sm text-[#888]">{phoneDisplay}</p>
              </div>
            </a>

            {/* Email */}
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-4 p-6 rounded-2xl border border-white/10 bg-[#1A1A1A] hover:border-[#D4A017]/40 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-[#D4A017]/10 flex items-center justify-center flex-shrink-0">
                <Mail size={22} className="text-[#D4A017]" />
              </div>
              <div>
                <p className="font-semibold text-white">Email</p>
                <p className="text-sm text-[#888]">{email}</p>
              </div>
            </a>

            {/* Hours */}
            <div className="flex items-center gap-4 p-6 rounded-2xl border border-white/10 bg-[#1A1A1A]">
              <div className="w-12 h-12 rounded-xl bg-[#D4A017]/10 flex items-center justify-center flex-shrink-0">
                <Clock size={22} className="text-[#D4A017]" />
              </div>
              <div>
                <p className="font-semibold text-white">Working Hours</p>
                <p className="text-sm text-[#888]">{hours}</p>
                <p className="text-xs text-[#888] mt-0.5">Including weekends and public holidays</p>
              </div>
            </div>

            {/* Social Links */}
            {(instagram || youtube || facebook) && (
              <div className="flex items-center gap-3 pt-2">
                {instagram && (
                  <a href={instagram} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-[#1A1A1A] hover:border-[#D4A017]/40 transition-all text-sm text-[#888] hover:text-white">
                    <Instagram size={16} className="text-pink-400" /> Instagram
                  </a>
                )}
                {youtube && (
                  <a href={youtube} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-[#1A1A1A] hover:border-[#D4A017]/40 transition-all text-sm text-[#888] hover:text-white">
                    <Youtube size={16} className="text-red-400" /> YouTube
                  </a>
                )}
                {facebook && (
                  <a href={facebook} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-[#1A1A1A] hover:border-[#D4A017]/40 transition-all text-sm text-[#888] hover:text-white">
                    <Facebook size={16} className="text-blue-400" /> Facebook
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h2
              className="text-xl font-bold text-white mb-4"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Our Location
            </h2>

            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 p-5 rounded-2xl border border-white/10 bg-[#1A1A1A] hover:border-[#D4A017]/40 transition-all group"
            >
              <MapPin size={20} className="text-[#D4A017] mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-white">Bhadurpally</p>
                <p className="text-sm text-[#888] mt-1 whitespace-pre-line">{address}</p>
                <p className="text-xs text-[#888] mt-0.5">{phoneDisplay}</p>
                <p className="text-xs text-[#D4A017] mt-2 group-hover:underline">
                  Get Directions &#8594;
                </p>
              </div>
            </a>

            {/* FAQ nudge */}
            <div className="p-5 rounded-2xl border border-white/10 bg-[#1A1A1A]">
              <p className="text-sm text-[#888] mb-2">
                Have common questions? Check our FAQ for quick answers.
              </p>
              <Link href="/faq" className="text-sm text-[#D4A017] hover:underline">
                View FAQ &#8594;
              </Link>
            </div>

            {/* Book Now CTA */}
            <Link
              href="/theaters"
              className="block w-full text-center py-4 bg-[#D4A017] text-black font-bold rounded-2xl hover:bg-[#D4A017]/90 transition-all"
            >
              Browse &amp; Book Theaters
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
