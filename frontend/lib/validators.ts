/**
 * lib/validators.ts
 * Zod validation schemas for all frontend forms.
 * Used with React Hook Form's zodResolver for type-safe form validation.
 */
import { z } from 'zod';

/** OTP login — phone number entry */
export const PhoneSchema = z.object({
  phone: z
    .string()
    .min(10, 'Enter a valid 10-digit mobile number')
    .max(13, 'Phone number too long')
    .regex(/^(\+91)?[6-9]\d{9}$/, 'Enter a valid Indian mobile number'),
});

/** OTP verification */
export const OtpSchema = z.object({
  phone: z.string(),
  otp: z
    .string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only digits'),
});

/** Step 2 — Occasion selection */
export const OccasionSchema = z.object({
  occasion: z.string().min(1, 'Please select an occasion'),
  occasion_name: z.string().max(20, 'Name must be 20 characters or less').optional(),
});

/** Step 6 — Booking details form */
export const BookingDetailsSchema = z.object({
  customer_name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long'),
  customer_phone: z
    .string()
    .regex(/^(\+91)?[6-9]\d{9}$/, 'Enter a valid Indian mobile number'),
  customer_email: z
    .string()
    .email('Enter a valid email address')
    .optional()
    .or(z.literal('')),
  coupon_code: z.string().optional(),
  referral_code: z.string().optional(),
});

/** Admin login */
export const AdminLoginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

/** Review submission */
export const ReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500, 'Comment must be 500 characters or less').optional(),
});

// Inferred TypeScript types from each schema — use these in form components
// instead of duplicating the shape manually.

/** Inferred type for PhoneSchema */
export type PhoneFormValues = z.infer<typeof PhoneSchema>;

/** Inferred type for OtpSchema */
export type OtpFormValues = z.infer<typeof OtpSchema>;

/** Inferred type for OccasionSchema */
export type OccasionFormValues = z.infer<typeof OccasionSchema>;

/** Inferred type for BookingDetailsSchema */
export type BookingDetailsFormValues = z.infer<typeof BookingDetailsSchema>;

/** Inferred type for AdminLoginSchema */
export type AdminLoginFormValues = z.infer<typeof AdminLoginSchema>;

/** Inferred type for ReviewSchema */
export type ReviewFormValues = z.infer<typeof ReviewSchema>;
