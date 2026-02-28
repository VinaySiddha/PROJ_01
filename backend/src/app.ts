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
app.use(cors({
  origin: [config.FRONTEND_URL, 'http://localhost:3000'],
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

// ── Swagger UI (dev only) ──────────────────────────────────────────────────────
if (config.NODE_ENV !== 'production') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'CineNest API Docs',
    swaggerOptions: { persistAuthorization: true },
  }));
  logger.info('Swagger UI available at /api-docs');
}

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api', router);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global error handler (must be last) ───────────────────────────────────────
app.use(errorHandler);

export default app;
