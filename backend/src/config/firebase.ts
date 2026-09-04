import admin from 'firebase-admin';
import { config } from './index';
import { logger } from '../utils/logger';

let firebaseInitialized = false;

export const initializeFirebase = (): void => {
  if (firebaseInitialized) return;

  if (!config.firebase.clientEmail || !config.firebase.privateKey || config.firebase.privateKey.includes('YOUR_KEY')) {
    logger.warn('⚠️ Firebase credentials not configured. Running in offline/mock mode for local development.');
    return;
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.firebase.projectId,
        clientEmail: config.firebase.clientEmail,
        privateKey: config.firebase.privateKey,
      }),
    });

    firebaseInitialized = true;
    logger.info('✅ Firebase Admin SDK initialized');
  } catch (error) {
    if (config.env === 'production') {
      logger.error('Failed to initialize Firebase Admin SDK:', error);
      throw error;
    } else {
      logger.warn(`⚠️ Firebase Admin SDK initialization skipped in dev mode: ${(error as Error).message}`);
    }
  }
};

export { admin, firebaseInitialized };
