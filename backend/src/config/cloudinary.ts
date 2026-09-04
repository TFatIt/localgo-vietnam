import { v2 as cloudinary } from 'cloudinary';
import { config } from './index';
import { logger } from '../utils/logger';

export const initializeCloudinary = (): void => {
  if (!config.cloudinary.cloudName || !config.cloudinary.apiKey) {
    logger.warn('⚠️ Cloudinary not configured. Image uploads will require valid credentials in .env.');
    return;
  }

  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
    secure: true,
  });
  logger.info('✅ Cloudinary initialized');
};

export { cloudinary };
