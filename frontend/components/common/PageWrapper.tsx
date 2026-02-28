/**
 * @file PageWrapper.tsx
 * @description Consistent page-level layout wrapper for CineNest. Server Component.
 * Applies max-width constraint, horizontal padding, and a CSS fade-in entry animation.
 */

import type { ReactNode } from 'react';

interface PageWrapperProps {
  /** Page content to render inside the wrapper. */
  children: ReactNode;
  /** Optional additional Tailwind classes for the inner content container. */
  className?: string;
}

/**
 * Wraps page content with CineNest's standard layout constraints.
 * Provides:
 * - `max-w-7xl` centered container with responsive horizontal padding
 * - Vertical padding (`py-10 sm:py-14`)
 * - CSS `animate-fade-in` class for page entry (define keyframes in globals.css)
 *
 * @example
 * // In a Next.js App Router page:
 * export default function HomePage() {
 *   return (
 *     <PageWrapper>
 *       <HeroSection />
 *       <FeaturedTheaters />
 *     </PageWrapper>
 *   );
 * }
 */
export function PageWrapper({ children, className = '' }: PageWrapperProps) {
  return (
    <main className="min-h-screen bg-[#0D0D0D]">
      <div
        className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 animate-fade-in ${className}`}
      >
        {children}
      </div>
    </main>
  );
}
