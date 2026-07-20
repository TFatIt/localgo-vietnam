import { Router } from 'express';
import {
  verifyAndLogin,
  getMe,
  updateProfile,
  updateFcmToken,
  deleteAccount,
} from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth';
import { authRateLimiter } from '../middlewares/rateLimiter';
import { uploadImage } from '../middlewares/upload';

const router = Router();

// Public
router.post('/login', authRateLimiter, verifyAndLogin);

// Protected
router.use(authenticate);
router.get('/me', getMe);
router.patch('/me', uploadImage.single('avatar'), updateProfile);
router.post('/fcm-token', updateFcmToken);
router.delete('/me', deleteAccount);

export default router;
