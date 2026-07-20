import admin from 'firebase-admin';
import { config } from './index';
import { logger } from '../utils/logger';

let firebaseInitialized = false;

export const initializeFirebase = (): void => {
  if (firebaseInitialized) return;

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
    logger.error('Failed to initialize Firebase Admin SDK:', error);
    throw error;
  }
};

export { admin };
