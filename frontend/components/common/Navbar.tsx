/**
 * @file Navbar.tsx
 * @description Sticky top navigation bar for theMagicshow with mobile hamburger menu,
 * active route highlighting, and animated mobile overlay menu.
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/book', label: 'Book Now' },
  { href: '/about', label: 'About' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/addons', label: 'Add-ons' },
  { href: '/my-bookings', label: 'My Bookings' },
] as const;

/**
 * theMagicshow top navigation bar.
 * Reads active route from usePathname. Handles mobile menu toggle with
 * AnimatePresence slide-down overlay.
 */
export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-[#0D0D0D]/95 backdrop-blur-md border-b border-[#D4A017]/20 shadow-lg shadow-black/40'
          : 'bg-[#0D0D0D]/80 backdrop-blur-sm border-b border-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand — logo with gold ring glow + Cormorant italic wordmark */}
          <Link href="/" className="flex items-center gap-3 group select-none">
            {/* Gold ring + soft glow around logo */}
            <span className="relative flex-shrink-0">
              <span
                className="absolute inset-0 rounded-full"
                style={{ boxShadow: '0 0 14px 2px rgba(212,160,23,0.30)' }}
                aria-hidden="true"
              />
              <Image
                src="/logo.png"
                alt="theMagicshow logo"
                width={40}
                height={40}
                priority
                className="relative rounded-full ring-1 ring-[#D4A017]/50 group-hover:scale-105 transition-transform duration-300"
              />
            </span>

            {/* Wordmark: italic Cormorant + thin gold rule */}
            <span className="flex flex-col leading-none">
              <span
                className="text-[#D4A017] font-bold italic tracking-wide"
                style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem' }}
              >
                theMagicshow
              </span>
              <span
                className="block h-px w-full mt-0.5"
                style={{ background: 'linear-gradient(90deg, #D4A017 60%, transparent 100%)' }}
                aria-hidden="true"
              />
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => {
              const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
              const isBookNow = label === 'Book Now';
              if (isBookNow) return null;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`link-gold-underline px-2 py-2 text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'text-[#D4A017]'
                      : 'text-gray-300 hover:text-white'
                  }`}
                  data-active={isActive ? 'true' : undefined}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* CTA + Hamburger */}
          <div className="flex items-center gap-3">
            <Link
              href="/book"
              className="hidden md:inline-flex items-center px-4 py-2 rounded-md text-sm font-semibold text-black transition-all duration-300"
              style={{
                background: 'linear-gradient(90deg, #D4A017 0%, #E6B020 50%, #D4A017 100%)',
                backgroundSize: '200% auto',
                backgroundPosition: 'left center',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.backgroundPosition = 'right center';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.backgroundPosition = 'left center';
              }}
            >
              Book Now
            </Link>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className="md:hidden p-2 rounded-md text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile overlay menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="fixed inset-0 top-16 z-40 bg-[#0D0D0D] flex flex-col px-6 pt-8 gap-2 md:hidden"
          >
            {NAV_LINKS.map(({ href, label }) => {
              const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={`py-3 text-lg font-medium border-b border-white/10 transition-colors ${
                    isActive ? 'text-[#D4A017]' : 'text-gray-200 hover:text-white'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
            <Link
              href="/book"
              onClick={() => setMenuOpen(false)}
              className="mt-6 w-full text-center py-3 rounded-md bg-[#D4A017] text-black font-semibold text-base hover:bg-[#e6b120] transition-colors"
            >
              Book Now
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
