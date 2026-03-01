/**
 * @file Server entry point — starts HTTP server and registers cleanup handlers
 * @module server
 */
import app from './app';
import { config } from './config/index';
import { logger } from './utils/logger';
import { disconnectRedis } from './redis/client';
import { prisma } from './prisma/client';

const PORT = config.PORT;

/** Start HTTP server */
const server = app.listen(PORT, () => {
  logger.info(`The Magic Screen API running`, {
    port: PORT,
    env: config.NODE_ENV,
    url: `http://localhost:${PORT}/api/health`,
  });
});

/** Start cron jobs */
async function startJobs(): Promise<void> {
  const { startReminderJob } = await import('./jobs/reminderJob');
  startReminderJob();
  logger.info('Cron jobs started');
}

startJobs().catch((err: unknown) => {
  logger.error('Failed to start cron jobs', { error: err });
});

/** Graceful shutdown handler */
async function shutdown(signal: string): Promise<void> {
  logger.info(`${signal} received — shutting down gracefully`);

  server.close(async () => {
    logger.info('HTTP server closed');

    await Promise.allSettled([
      prisma.$disconnect(),
      disconnectRedis(),
    ]);

    logger.info('Database and Redis disconnected');
    process.exit(0);
  });

  // Force exit after 10 seconds if graceful shutdown fails
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10_000);
}

process.on('SIGTERM', () => { void shutdown('SIGTERM'); });
process.on('SIGINT', () => { void shutdown('SIGINT'); });
process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { error: err.message, stack: err.stack });
  void shutdown('uncaughtException');
});
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', { reason });
  void shutdown('unhandledRejection');
});
