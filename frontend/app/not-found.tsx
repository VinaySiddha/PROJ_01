/**
 * @file 404 Not Found page
 * @module app/not-found
 */
import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 text-center">
      <p
        className="text-8xl font-bold text-[#D4A017] opacity-30"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        404
      </p>
      <div>
        <h1
          className="text-3xl font-bold text-white mb-2"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Page Not Found
        </h1>
        <p className="text-[#888] max-w-md">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>
      <Link
        href="/"
        className="flex items-center gap-2 px-6 py-3 bg-[#D4A017] text-black font-semibold rounded-xl hover:bg-[#D4A017]/90 transition-colors"
      >
        <Home size={16} /> Back to Home
      </Link>
    </div>
  );
}
