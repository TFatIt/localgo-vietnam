import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import path from 'path';

import { config } from './config';
import { globalRateLimiter } from './middlewares/rateLimiter';
import { errorHandler, notFound } from './middlewares/errorHandler';
import { logger } from './utils/logger';
import { settingsService } from './services/settings.service';

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
      if (config.env === 'development' || !origin || config.cors.allowedOrigins.includes(origin)) {
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

// Static files & Admin portal (DulichViet styled CMS)
const publicDir = path.resolve(__dirname, '../public');
app.use(express.static(publicDir));
app.use('/admin', express.static(path.join(publicDir, 'admin')));

// Root & Health check
app.get('/', (req, res) => {
  if (req.accepts('html')) {
    return res.redirect('/admin');
  }
  res.json({
    status: 'ok',
    name: 'LocalGo Vietnam API',
    version: '1.0.0',
    env: config.env,
    adminPortal: '/admin',
    endpoints: {
      health: '/health',
      api: '/api/v1',
      admin: '/admin',
    },
  });
});

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: config.env,
    version: '1.0.0',
  });
});

// Admin SPA routing
app.get('/admin/*', (_req, res) => {
  res.sendFile(path.join(publicDir, 'admin/index.html'));
});

// API Routes
const API = '/api/v1';
app.get(API, (_req, res) => {
  res.json({
    status: 'ok',
    message: 'LocalGo Vietnam API v1 is online',
    version: '1.0.0',
    admin: '/admin',
  });
});

// Public Site Settings (for Frontend/Mobile to sync with CMS)
app.get(`${API}/settings`, async (_req, res) => {
  try {
    const settings = await settingsService.getSettings();
    res.json({ success: true, data: { settings } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

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
