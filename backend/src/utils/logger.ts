/**
 * utils/logger.ts
 *
 * Centralized Winston logger for the entire backend.
 * - Development: pretty-printed, colorized, timestamp HH:mm:ss
 * - Production: structured JSON with full timestamp (captured by Railway/Render)
 *
 * Import this everywhere. NEVER use console.log in production code.
 */
import winston from 'winston';

// Determine environment directly from process.env to avoid circular imports
// config/index.ts imports logger indirectly through services, so we read raw here
const isProduction = process.env['NODE_ENV'] === 'production';
const isDevelopment = !isProduction;

// Define custom log levels from most to least severe
const LOG_LEVELS: winston.config.AbstractConfigSetLevels = {
  error: 0, // Unhandled exceptions, payment failures, DB connection loss
  warn: 1,  // Recoverable issues — retried operations, deprecated usage
  info: 2,  // Key business events — booking created, payment received
  debug: 3, // Detailed flow tracing — only emitted in development
};

// Color mapping for development pretty-print
winston.addColors({
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue',
});

// JSON format for production — structured logs queryable in log platforms
const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }), // Includes full stack trace on Error objects
  winston.format.json(),
);

// Pretty format for local development — human-readable with colors
const prettyFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    // Only append meta if it has keys — avoids trailing "{}" on simple log lines
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp as string}] ${level}: ${message as string}${metaStr}`;
  }),
);

export const logger = winston.createLogger({
  levels: LOG_LEVELS,
  // Emit debug logs in development only — avoids noise in production
  level: isDevelopment ? 'debug' : 'info',
  format: isProduction ? jsonFormat : prettyFormat,
  transports: [
    // Write to stdout — platform captures and routes it to log storage
    new winston.transports.Console(),
  ],
});
