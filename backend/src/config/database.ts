import mongoose from 'mongoose';
import { config } from './index';
import { logger } from '../utils/logger';

let isDbConnected = false;

export const connectDatabase = async (): Promise<void> => {
  try {
    mongoose.set('strictQuery', true);

    if (!config.mongodb.uri || config.mongodb.uri.includes('<username>') || config.mongodb.uri.includes('<password>')) {
      logger.warn('⚠️ MongoDB URI contains placeholder. Database connection skipped for offline development.');
      return;
    }

    await mongoose.connect(config.mongodb.uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 1500,
      socketTimeoutMS: 45000,
    });

    isDbConnected = true;
    logger.info('✅ MongoDB connected successfully');

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting to reconnect...');
      isDbConnected = false;
    });

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });
  } catch (error) {
    if (config.env === 'production') {
      logger.error('Failed to connect to MongoDB:', error);
      process.exit(1);
    } else {
      logger.warn(`⚠️ Could not connect to MongoDB (${(error as Error).message}). Server running in offline test mode.`);
    }
  }
};

export { isDbConnected };
