/**
 * @file ErrorMessage.tsx
 * @description Reusable error state component for CineNest. Server Component.
 * Displays an icon, title, message, and an optional retry action button
 * in a destructive red color scheme.
 */

import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  /** Short heading summarising the error. */
  title: string;
  /** Detailed description of what went wrong. */
  message: string;
  /**
   * When provided, a "Try Again" button is rendered.
   * Must be a client-side handler — compose with a Client Component wrapper
   * if needed when this is embedded in a Server Component tree.
   */
  onRetry?: () => void;
  /** Additional Tailwind classes for the root container. */
  className?: string;
}

/**
 * Error message block with icon, heading, body text, and optional retry CTA.
 *
 * @example
 * <ErrorMessage
 *   title="Could not load theaters"
 *   message="Please check your connection and try again."
 *   onRetry={() => router.refresh()}
 * />
 */
export function ErrorMessage({
  title,
  message,
  onRetry,
  className = '',
}: ErrorMessageProps) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center gap-4 rounded-xl bg-red-950/30 border border-red-700/40 px-6 py-10 text-center ${className}`}
    >
      {/* Icon */}
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-900/40 border border-red-700/50">
        <AlertCircle className="w-7 h-7 text-red-400" />
      </div>

      {/* Text */}
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold text-red-300">{title}</h3>
        <p className="text-sm text-red-400/80 max-w-sm leading-relaxed">{message}</p>
      </div>

      {/* Retry button — rendered only when handler is provided */}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 px-5 py-2 rounded-md border border-red-600/60 text-red-300 text-sm font-medium
                     hover:bg-red-800/30 hover:text-red-200 transition-colors duration-200 focus-visible:outline
                     focus-visible:outline-2 focus-visible:outline-red-500"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
