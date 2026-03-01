/**
 * config/index.ts
 * Reads and validates all required environment variables at startup using Zod.
 * App crashes immediately if a required var is missing — fail fast principle.
 * Import `config` everywhere you need env vars — never use process.env directly.
 */
import { z } from 'zod';
import dotenv from 'dotenv';

// Load .env file before validation
dotenv.config();

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.string().default('4000').transform(Number),
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  RAZORPAY_KEY_ID: z.string().min(1, 'RAZORPAY_KEY_ID is required'),
  RAZORPAY_KEY_SECRET: z.string().min(1, 'RAZORPAY_KEY_SECRET is required'),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1, 'RAZORPAY_WEBHOOK_SECRET is required'),
  PHONEPE_MERCHANT_ID: z.string().optional(),
  PHONEPE_API_KEY: z.string().optional(),
  PHONEPE_WEBHOOK_SECRET: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().min(1, 'CLOUDINARY_CLOUD_NAME is required'),
  CLOUDINARY_API_KEY: z.string().min(1, 'CLOUDINARY_API_KEY is required'),
  CLOUDINARY_API_SECRET: z.string().min(1, 'CLOUDINARY_API_SECRET is required'),
  WATI_API_KEY: z.string().min(1, 'WATI_API_KEY is required'),
  WATI_API_ENDPOINT: z.string().url('WATI_API_ENDPOINT must be a valid URL'),
  WATI_BUSINESS_PHONE: z.string().min(10, 'WATI_BUSINESS_PHONE is required'),
  FRONTEND_URL: z.string().default('http://localhost:3000'), // comma-separated allowed
});

// Parse and validate — throws ZodError with descriptive messages if anything is missing/wrong
const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌  Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1); // Crash immediately — never run with missing config
}

export const config = parsed.data;

// Convenience boolean for environment checks
export const isDev = config.NODE_ENV === 'development';
export const isProd = config.NODE_ENV === 'production';
