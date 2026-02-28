/**
 * prisma/client.ts
 *
 * Singleton Prisma client instance shared across the entire backend.
 * In development, attaches to the global object to survive hot-reload without
 * creating a new connection pool on every file save.
 *
 * Import `prisma` from this file everywhere DB access is needed.
 * NEVER instantiate PrismaClient directly in any other file.
 */
import { PrismaClient } from '@prisma/client';

// Extend global type to hold the Prisma singleton in development
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

/**
 * The singleton Prisma client.
 * In development: reuses the global instance across hot-reloads.
 * In production: creates a single instance for the process lifetime.
 */
export const prisma: PrismaClient =
  global.__prisma ??
  new PrismaClient({
    // Log only errors in production; log queries and errors in development
    log:
      process.env['NODE_ENV'] === 'development'
        ? ['error', 'warn']
        : ['error'],
  });

if (process.env['NODE_ENV'] !== 'production') {
  // Attach to global in development to reuse across tsx watch hot-reloads
  // This prevents "too many connections" errors during development
  global.__prisma = prisma;
}
