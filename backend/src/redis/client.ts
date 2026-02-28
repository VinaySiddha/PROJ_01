/**
 * redis/client.ts
 *
 * Singleton Redis client using ioredis.
 * Used for: slot locking (10-min TTL), OTP storage (5-min TTL), and caching.
 *
 * NEVER instantiate Redis directly elsewhere — always import `redis` from here.
 */
import Redis from 'ioredis';
import { logger } from '../utils/logger';

// Read Redis URL directly from process.env to avoid circular imports
// (config/index.ts may import services that import redis)
const REDIS_URL = process.env['REDIS_URL'];

if (!REDIS_URL) {
  // Fail fast — Redis is required for slot locking
  logger.error('REDIS_URL environment variable is not set. Exiting.');
  process.exit(1);
}

/**
 * The singleton ioredis client instance.
 * Automatically reconnects on connection loss (ioredis handles this).
 */
export const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,     // Retry failed commands up to 3 times
  connectTimeout: 10_000,       // 10 seconds to establish initial connection
  lazyConnect: true,            // Don't connect until first command (avoids startup crash)
  enableReadyCheck: true,       // Only emit 'ready' after Redis confirms it's ready
});

// Log connection lifecycle events for monitoring
redis.on('connect', () => logger.info('Redis client connected'));
redis.on('ready', () => logger.info('Redis client ready'));
redis.on('error', (err: Error) => logger.error('Redis client error', { error: err.message }));
redis.on('close', () => logger.warn('Redis connection closed'));
redis.on('reconnecting', () => logger.warn('Redis client reconnecting...'));

/**
 * Gracefully disconnects the Redis client.
 * Called during app shutdown to cleanly close the connection.
 */
export const disconnectRedis = async (): Promise<void> => {
  await redis.quit();
  logger.info('Redis client disconnected gracefully');
};
