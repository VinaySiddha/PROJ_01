/**
 * @file Express application setup — middleware chain, routes, error handler
 * @module app
 */
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import { requestIdMiddleware } from './middleware/requestId.middleware';
import { errorHandler } from './middleware/errorHandler';
import { generalRateLimiter } from './middleware/rateLimiter';
import router from './routes/index';
import { config } from './config/index';
import { logger } from './utils/logger';
import { swaggerSpec } from './swagger';

/** Create and configure Express application */
const app: Application = express();

// ── Security headers ─────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false, // Frontend handles CSP
}));

// ── CORS ──────────────────────────────────────────────────────────────────────
// FRONTEND_URL supports comma-separated values, e.g.:
//   https://themagicscreen.com,https://www.themagicscreen.com
const allowedOrigins = new Set([
  ...config.FRONTEND_URL.split(',').map((u) => u.trim()).filter(Boolean),
  'http://localhost:3000',
  'http://localhost:3001',
]);

const isDevTunnelOrigin = (origin: string): boolean => {
  if (!origin.startsWith('https://')) return false;
  return /\.devtunnels\.ms$/i.test(origin);
};

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server (no origin header) and whitelisted origins
    if (!origin || allowedOrigins.has(origin) || isDevTunnelOrigin(origin)) return callback(null, true);
    logger.warn('CORS blocked', { origin });
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
}));

// ── Compression ───────────────────────────────────────────────────────────────
app.use(compression());

// ── Request ID (must be before body parsers) ──────────────────────────────────
app.use(requestIdMiddleware);

// ── Body parsing ──────────────────────────────────────────────────────────────
// Note: /api/payments/razorpay/webhook uses express.raw() at the route level
// to preserve raw body for signature verification. JSON parser must come AFTER
// raw body is captured.
app.use((req, res, next) => {
  // Capture raw body for webhook routes before JSON parsing
  if (req.path === '/api/payments/razorpay/webhook') {
    return next();
  }
  express.json({ limit: '10mb' })(req, res, next);
});
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Global rate limiter ───────────────────────────────────────────────────────
app.use('/api', generalRateLimiter);

// ── Request logging ───────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    requestId: _res.locals['requestId'],
    ip: req.ip,
  });
  next();
});

// ── Swagger UI ────────────────────────────────────────────────────────────────
// Override the servers list so Swagger UI calls the correct host in production.
// Set BACKEND_URL env var on Render (e.g. https://proj-01-hy9i.onrender.com).
const swaggerRuntimeSpec = {
  ...swaggerSpec,
  servers: [
    {
      url: process.env['BACKEND_URL'] ?? `http://localhost:${config.PORT}`,
      description: 'API Server',
    },
  ],
};
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerRuntimeSpec, {
  customSiteTitle: 'The Magic Screen API Docs',
  swaggerOptions: { persistAuthorization: true },
}));
logger.info('Swagger UI available at /api-docs');

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api', router);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global error handler (must be last) ───────────────────────────────────────
app.use(errorHandler);

export default app;
