/**
 * @file Contact page — contact info, locations map, WhatsApp CTA
 * @module app/(public)/contact/page
 */
import type { Metadata } from 'next';
import { Phone, Mail, MapPin, MessageCircle, Clock } from 'lucide-react';
import { WHATSAPP_SUPPORT_LINK } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with The Magic Screen. Contact us via WhatsApp, email, or visit our theaters in Hyderabad.',
};

export default function ContactPage() {
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

            {/* WhatsApp CTA */}
            <a
              href={WHATSAPP_SUPPORT_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-6 rounded-2xl border border-green-500/30 bg-green-500/5 hover:bg-green-500/10 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <MessageCircle size={22} className="text-green-400" />
              </div>
              <div>
                <p className="font-semibold text-white">WhatsApp (Fastest)</p>
                <p className="text-sm text-[#888]">+91 99999 99999 &mdash; Replies within minutes</p>
                <p className="text-xs text-green-400 mt-1">Tap to open WhatsApp &#8594;</p>
              </div>
            </a>

            {/* Phone */}
            <a
              href="tel:+919999999999"
              className="flex items-center gap-4 p-6 rounded-2xl border border-white/10 bg-[#1A1A1A] hover:border-[#D4A017]/40 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-[#D4A017]/10 flex items-center justify-center flex-shrink-0">
                <Phone size={22} className="text-[#D4A017]" />
              </div>
              <div>
                <p className="font-semibold text-white">Phone</p>
                <p className="text-sm text-[#888]">+91 99999 99999</p>
              </div>
            </a>

            {/* Email */}
            <a
              href="mailto:hello@themagicscreen.com"
              className="flex items-center gap-4 p-6 rounded-2xl border border-white/10 bg-[#1A1A1A] hover:border-[#D4A017]/40 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-[#D4A017]/10 flex items-center justify-center flex-shrink-0">
                <Mail size={22} className="text-[#D4A017]" />
              </div>
              <div>
                <p className="font-semibold text-white">Email</p>
                <p className="text-sm text-[#888]">hello@themagicscreen.com</p>
              </div>
            </a>

            {/* Hours */}
            <div className="flex items-center gap-4 p-6 rounded-2xl border border-white/10 bg-[#1A1A1A]">
              <div className="w-12 h-12 rounded-xl bg-[#D4A017]/10 flex items-center justify-center flex-shrink-0">
                <Clock size={22} className="text-[#D4A017]" />
              </div>
              <div>
                <p className="font-semibold text-white">Working Hours</p>
                <p className="text-sm text-[#888]">9:00 AM &ndash; 1:00 AM, Every Day</p>
                <p className="text-xs text-[#888] mt-0.5">Including weekends and public holidays</p>
              </div>
            </div>
          </div>

          {/* Locations */}
          <div className="space-y-4">
            <h2
              className="text-xl font-bold text-white mb-4"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Our Locations
            </h2>

            <a
              href="https://maps.google.com/?q=Bhadurpally+Hyderabad"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 p-5 rounded-2xl border border-white/10 bg-[#1A1A1A] hover:border-[#D4A017]/40 transition-all group"
            >
              <MapPin
                size={20}
                className="text-[#D4A017] mt-0.5 flex-shrink-0"
              />
              <div>
                <p className="font-semibold text-white">Bhadurpally</p>
                <p className="text-sm text-[#888] mt-1">
                  Bhadurpally, Hyderabad, Telangana 500055
                </p>
                <p className="text-xs text-[#888] mt-0.5">+91 99999 99999</p>
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
              <a
                href="/faq"
                className="text-sm text-[#D4A017] hover:underline"
              >
                View FAQ &#8594;
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
