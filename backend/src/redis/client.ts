/**
 * @file In-memory TTL store — drop-in replacement for Redis client.
 * Implements the subset of ioredis methods used in this project.
 * No external service required; data lives in process memory.
 * On Render (single instance), this is perfectly adequate.
 */
import { logger } from '../utils/logger';

interface Entry {
  value: string;
  expiresAt: number | null; // null = no expiry
}

const store = new Map<string, Entry>();

/** Remove expired entries (lazy eviction on access + periodic sweep) */
function get_(key: string): Entry | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry;
}

// Periodic sweep every 5 minutes to prevent unbounded memory growth
setInterval(() => {
  const now = Date.now();
  let swept = 0;
  for (const [key, entry] of store) {
    if (entry.expiresAt !== null && now > entry.expiresAt) {
      store.delete(key);
      swept++;
    }
  }
  if (swept > 0) logger.debug(`Memory store: swept ${swept} expired keys`);
}, 5 * 60 * 1000).unref(); // .unref() so this timer doesn't prevent process exit

/** In-memory implementation of the Redis commands used in this project */
export const redis = {
  /** GET key → string value or null */
  get: async (key: string): Promise<string | null> => {
    return get_(key)?.value ?? null;
  },

  /** SET key value EX ttlSeconds */
  setex: async (key: string, ttlSeconds: number, value: string): Promise<'OK'> => {
    store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
    return 'OK';
  },

  /** DEL key [key ...] */
  del: async (...keys: string[]): Promise<number> => {
    let count = 0;
    for (const key of keys) {
      if (store.delete(key)) count++;
    }
    return count;
  },

  /** INCR key → new integer value */
  incr: async (key: string): Promise<number> => {
    const entry = get_(key);
    const current = entry ? parseInt(entry.value, 10) : 0;
    const next = (isNaN(current) ? 0 : current) + 1;
    store.set(key, {
      value: String(next),
      expiresAt: entry?.expiresAt ?? null,
    });
    return next;
  },

  /** EXPIRE key ttlSeconds → 1 if key exists, 0 if not */
  expire: async (key: string, ttlSeconds: number): Promise<0 | 1> => {
    const entry = get_(key);
    if (!entry) return 0;
    store.set(key, { value: entry.value, expiresAt: Date.now() + ttlSeconds * 1000 });
    return 1;
  },

  /** QUIT — no-op for in-memory store */
  quit: async (): Promise<'OK'> => 'OK',
};

/** No-op disconnect — kept so server.ts compiles without changes */
export const disconnectRedis = async (): Promise<void> => {
  logger.info('In-memory store cleared (no external connection to close)');
  store.clear();
};
