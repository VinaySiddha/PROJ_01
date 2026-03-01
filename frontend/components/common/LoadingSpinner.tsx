/**
 * @file LoadingSpinner.tsx
 * @description Reusable loading spinner component for The Magic Screen.
 * Server Component — uses only Tailwind CSS animate-spin.
 * Supports size variants, color variants, and full-screen overlay mode.
 */

interface LoadingSpinnerProps {
  /** Controls the diameter of the spinner ring. */
  size?: 'sm' | 'md' | 'lg';
  /** Gold matches the brand accent; white is used on dark surfaces. */
  color?: 'gold' | 'white';
  /** When true, renders a fixed full-viewport overlay centered on screen. */
  fullScreen?: boolean;
}

const SIZE_MAP: Record<NonNullable<LoadingSpinnerProps['size']>, string> = {
  sm: 'w-5 h-5 border-2',
  md: 'w-9 h-9 border-[3px]',
  lg: 'w-14 h-14 border-4',
};

const COLOR_MAP: Record<NonNullable<LoadingSpinnerProps['color']>, string> = {
  gold: 'border-[#D4A017] border-t-transparent',
  white: 'border-white border-t-transparent',
};

/**
 * Animated loading spinner.
 *
 * @example
 * // Inline usage
 * <LoadingSpinner size="md" color="gold" />
 *
 * @example
 * // Full screen overlay
 * <LoadingSpinner size="lg" color="gold" fullScreen />
 */
export function LoadingSpinner({
  size = 'md',
  color = 'gold',
  fullScreen = false,
}: LoadingSpinnerProps) {
  const spinnerEl = (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block rounded-full animate-spin ${SIZE_MAP[size]} ${COLOR_MAP[color]}`}
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D0D0D]/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          {spinnerEl}
          <span className="text-sm text-gray-400 animate-pulse">Loading…</span>
        </div>
      </div>
    );
  }

  return spinnerEl;
}
