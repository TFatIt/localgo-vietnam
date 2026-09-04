import dotenv from 'dotenv';
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
];

if (isProduction) {
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }
}

export const config = {
  env: (process.env.NODE_ENV as string) || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:5000',

  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/localgo-vietnam',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'localgo_dev_super_secret_jwt_key_min_32_chars_long',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'localgo_dev_refresh_secret_key_32_chars_min',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || 'localgo-dev',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
  },

  gemini: {
    apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  },

  googleMaps: {
    apiKey: process.env.GOOGLE_MAPS_API_KEY || '',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },

  cors: {
    allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5173,http://localhost:19006,exp://').split(','),
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
} as const;
