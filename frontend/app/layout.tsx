/**
 * @file Root layout — wraps all pages with providers, Navbar, and Footer
 * @module app/layout
 */
import type { Metadata } from 'next';
import { DM_Sans, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import Providers from './providers';

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', display: 'swap' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'CineNest — Private Theater Booking in Hyderabad', template: '%s | CineNest' },
  description:
    'Book a private theater in Hyderabad for birthdays, anniversaries, date nights, and special celebrations. Premium experience at Hitec City & Miyapur.',
  keywords: [
    'private theater hyderabad',
    'private screening hyderabad',
    'birthday celebration hyderabad',
    'anniversary date hyderabad',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'CineNest',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${playfair.variable}`}>
      <body className="bg-[#0D0D0D] text-white font-sans antialiased">
        <Providers>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
