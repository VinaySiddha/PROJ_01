/**
 * @file Footer.tsx
 * @description Site-wide footer for CineNest. Server Component.
 * Contains logo, tagline, navigation links, contact info, social links,
 * WhatsApp CTA, and legal bottom bar.
 */

import Link from 'next/link';
import { Film, Phone, Mail, MapPin, MessageCircle, Instagram, Youtube, Facebook } from 'lucide-react';
import { WHATSAPP_SUPPORT_LINK } from '@/lib/constants';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/book', label: 'Book Now' },
  { href: '/about', label: 'About Us' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/addons', label: 'Add-ons' },
  { href: '/my-bookings', label: 'My Bookings' },
];

const LEGAL_LINKS = [
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/refund', label: 'Refund Policy' },
  { href: '/terms', label: 'Terms & Conditions' },
];

/**
 * CineNest site footer. Server Component — no interactivity required.
 * Renders full footer with navigation, contact info, social links, and legal bar.
 */
export function Footer() {
  return (
    <footer className="bg-[#0D0D0D] border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand column */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Film className="w-6 h-6 text-[#D4A017]" />
              <span className="text-2xl font-bold text-[#D4A017]" style={{ fontFamily: "'Playfair Display', serif" }}>
                CineNest
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              Your private cinema experience. Celebrate every special moment in luxury,
              comfort, and cinematic style.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-3 mt-1">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                aria-label="Instagram"
                className="p-2 rounded-full bg-white/5 hover:bg-[#D4A017]/20 hover:text-[#D4A017] text-gray-400 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"
                aria-label="YouTube"
                className="p-2 rounded-full bg-white/5 hover:bg-[#D4A017]/20 hover:text-[#D4A017] text-gray-400 transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                aria-label="Facebook"
                className="p-2 rounded-full bg-white/5 hover:bg-[#D4A017]/20 hover:text-[#D4A017] text-gray-400 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation column */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Navigation
            </h3>
            <ul className="flex flex-col gap-2">
              {NAV_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href}
                    className="text-sm text-gray-400 hover:text-[#D4A017] transition-colors duration-200">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact column */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Contact Us
            </h3>
            <ul className="flex flex-col gap-3">
              <li className="flex items-start gap-2 text-sm text-gray-400">
                <MapPin className="w-4 h-4 text-[#D4A017] mt-0.5 shrink-0" />
                <span>123 Cinema Lane, Hyderabad, Telangana 500001</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <Phone className="w-4 h-4 text-[#D4A017] shrink-0" />
                <a href="tel:+919000000000" className="hover:text-white transition-colors">+91 90000 00000</a>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <Mail className="w-4 h-4 text-[#D4A017] shrink-0" />
                <a href="mailto:hello@cinenest.in" className="hover:text-white transition-colors">hello@cinenest.in</a>
              </li>
            </ul>
            <a
              href={WHATSAPP_SUPPORT_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-md bg-[#25D366] text-white text-sm font-semibold hover:bg-[#1ebe5d] transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Chat on WhatsApp
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            &copy; 2026 CineNest. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {LEGAL_LINKS.map(({ href, label }) => (
              <Link key={href} href={href}
                className="text-xs text-gray-500 hover:text-[#D4A017] transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
