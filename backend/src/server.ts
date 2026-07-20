import { config } from './config';
import { connectDatabase } from './config/database';
import { initializeFirebase } from './config/firebase';
import { initializeCloudinary } from './config/cloudinary';
import { logger } from './utils/logger';
import app from './app';

const startServer = async (): Promise<void> => {
  try {
    // Initialize services
    initializeFirebase();
    initializeCloudinary();
    await connectDatabase();

    const server = app.listen(config.port, () => {
      logger.info(`🚀 LocalGo Vietnam API running on port ${config.port} [${config.env}]`);
      logger.info(`📍 API base: http://localhost:${config.port}/api/v1`);
      logger.info(`❤️  Health: http://localhost:${config.port}/health`);
    });

    // Graceful shutdown
    const shutdown = (signal: string) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });

      setTimeout(() => {
        logger.error('Forced shutdown after 10s');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('uncaughtException', (err) => {
      logger.error('Uncaught Exception:', err);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled Rejection:', reason);
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
