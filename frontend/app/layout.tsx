/**
 * @file Root layout — wraps all pages with providers, Navbar, and Footer
 * @module app/layout
 */
import type { Metadata } from 'next';
import { Cormorant_Garamond, Outfit, Dancing_Script } from 'next/font/google';
import './globals.css';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import Providers from './providers';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  weight: ['600'],
  variable: '--font-script',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'The Magic Screen — Private Theater Booking in Hyderabad', template: '%s | The Magic Screen' },
  description:
    'Book a private theater in Hyderabad for birthdays, anniversaries, date nights, and special celebrations. Premium private theater experience in Bhadurpally, Hyderabad.',
  keywords: [
    'private theater hyderabad',
    'private screening hyderabad',
    'birthday celebration hyderabad',
    'anniversary date hyderabad',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'The Magic Screen',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${outfit.variable} ${dancingScript.variable}`}>
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
