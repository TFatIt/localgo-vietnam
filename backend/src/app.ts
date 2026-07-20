import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';

import { config } from './config';
import { globalRateLimiter } from './middlewares/rateLimiter';
import { errorHandler, notFound } from './middlewares/errorHandler';
import { logger } from './utils/logger';

// Routes
import authRoutes from './routes/auth.routes';
import placeRoutes from './routes/place.routes';
import reviewRoutes from './routes/review.routes';
import communityRoutes from './routes/community.routes';
import aiRoutes from './routes/ai.routes';
import adminRoutes from './routes/admin.routes';
import engagementRoutes from './routes/engagement.routes';

const app: Application = express();

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: config.env === 'production',
    crossOriginEmbedderPolicy: false,
  }),
);

// CORS
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || config.cors.allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: Origin ${origin} not allowed`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  }),
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(compression());
app.use(globalRateLimiter);

// Logging
if (config.env !== 'test') {
  app.use(
    morgan('combined', {
      stream: { write: (message) => logger.info(message.trim()) },
    }),
  );
}

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: config.env,
    version: '1.0.0',
  });
});

// API Routes
const API = '/api/v1';
app.use(`${API}/auth`, authRoutes);
app.use(`${API}/places`, placeRoutes);
app.use(`${API}/places/:placeId/reviews`, reviewRoutes);
app.use(`${API}/community`, communityRoutes);
app.use(`${API}/ai`, aiRoutes);
app.use(`${API}/admin`, adminRoutes);
app.use(`${API}/me`, engagementRoutes);

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

export default app;
