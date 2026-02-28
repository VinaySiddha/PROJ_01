/**
 * lib/formatters.ts
 * Pure formatting utility functions for the frontend.
 * No imports from app code — safe to use anywhere without circular deps.
 */

/**
 * Formats an integer INR amount to a display string with the ₹ symbol.
 * @example formatCurrency(1799) → '₹1,799'
 */
export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

/**
 * Formats an ISO date string to a human-readable date.
 * @example formatDate('2026-03-15') → '15 Mar 2026'
 */
export const formatDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

/**
 * Formats a time string 'HH:MM' to 12-hour display.
 * @example formatTime('17:00') → '5:00 PM'
 */
export const formatTime = (timeStr: string): string => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date();
  // Use nullish coalescing to satisfy strict null checks — split will always
  // produce at least one element, but TypeScript cannot infer this from .map()
  date.setHours(hours ?? 0, minutes ?? 0);
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
};

/**
 * Formats a slot as "Evening · 5:00 PM – 9:00 PM"
 */
export const formatSlot = (slotName: string, start: string, end: string): string =>
  `${slotName} · ${formatTime(start)} – ${formatTime(end)}`;

/**
 * Truncates text to a max length with ellipsis.
 * @example truncate('Hello World', 8) → 'Hello...'
 */
export const truncate = (text: string, maxLength: number): string =>
  text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;

/**
 * Formats a booking reference for display.
 * @example formatBookingRef('CNB-A1B2C3D4') → '#CNB-A1B2C3D4'
 */
export const formatBookingRef = (ref: string): string => `#${ref}`;

/**
 * Returns a relative time string from a date (e.g. '2 hours ago').
 */
export const formatRelativeTime = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

/**
 * Converts a camelCase or snake_case key to Title Case for display.
 * @example toTitleCase('bride_to_be') → 'Bride To Be'
 */
export const toTitleCase = (str: string): string =>
  str
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase());
