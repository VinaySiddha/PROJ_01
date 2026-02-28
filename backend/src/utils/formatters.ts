/**
 * utils/formatters.ts
 *
 * Pure utility functions for formatting values used across the backend.
 * These are stateless — no side effects, no imports from other app files.
 * Safe to import anywhere without creating circular dependencies.
 */

/**
 * Masks a phone number for safe logging.
 * Shows only the last 4 digits to avoid logging full phone numbers in production.
 *
 * @param phone - Full phone number string (e.g. '+919948954545')
 * @returns     - Masked phone (e.g. '+91*****4545')
 *
 * @example maskPhone('+919948954545') → '+91*****4545'
 */
export const maskPhone = (phone: string): string =>
  phone.replace(/(\d+)(\d{4})$/, (_, hidden: string, last4: string) =>
    '*'.repeat(hidden.length) + last4,
  );

/**
 * Formats an integer amount in paise/smallest unit to INR display string.
 * All monetary values in the DB are stored as integers (INR, not paise).
 *
 * @param amount - Amount in INR (integer)
 * @returns      - Formatted string, e.g. '₹1,799'
 *
 * @example formatCurrency(1799) → '₹1,799'
 */
export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0, // No decimal places — all amounts are whole rupees
  }).format(amount);

/**
 * Formats a Date object or ISO string to a human-readable date string.
 * Uses Indian locale (en-IN) for correct date display.
 *
 * @param date - Date object or ISO date string
 * @returns    - Formatted string, e.g. '28 Feb 2026'
 *
 * @example formatDate(new Date('2026-02-28')) → '28 Feb 2026'
 */
export const formatDate = (date: Date | string): string =>
  new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

/**
 * Formats a Date to a time string in 12-hour format with AM/PM.
 *
 * @param date - Date object or ISO string
 * @returns    - Time string, e.g. '09:00 AM'
 */
export const formatTime = (date: Date | string): string =>
  new Date(date).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

/**
 * Generates a human-readable booking reference from a UUID.
 * Takes first 8 characters, uppercased, prefixed with 'CNB-'.
 *
 * @param id - Full UUID string
 * @returns  - Short booking reference, e.g. 'CNB-A1B2C3D4'
 */
export const generateBookingRef = (id: string): string =>
  `CNB-${id.replace(/-/g, '').substring(0, 8).toUpperCase()}`;

/**
 * Sanitizes an object by replacing values of sensitive keys with '[REDACTED]'.
 * Used by ErrorLogService before storing request bodies in the database.
 * Operates recursively on nested objects.
 *
 * @param obj             - Object to sanitize (typically a request body)
 * @param sensitiveKeys   - Keys whose values should be redacted (case-insensitive match)
 * @returns               - New object with sensitive values replaced
 */
export const sanitizeObject = (
  obj: Record<string, unknown>,
  sensitiveKeys = ['password', 'otp', 'token', 'cardnumber', 'cvv', 'secret', 'key'],
): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      // Case-insensitive check against the sensitive keys list
      if (sensitiveKeys.includes(key.toLowerCase())) {
        return [key, '[REDACTED]'];
      }
      // Recurse into nested plain objects (not arrays, not null)
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        return [key, sanitizeObject(value as Record<string, unknown>, sensitiveKeys)];
      }
      return [key, value];
    }),
  );
