import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { authService } from '../services/auth.service';
import { User } from '../models/User';
import { asyncHandler, sendSuccess } from '../utils/helpers';
import { ValidationError } from '../utils/errors';
import { admin } from '../config/firebase';

export const verifyAndLogin = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { idToken, fcmToken } = req.body as { idToken: string; fcmToken?: string };

  if (!idToken) throw new ValidationError('Firebase ID token is required');

  // Verify Firebase token
  const decoded = await admin.auth().verifyIdToken(idToken);

  // Find or create user
  const user = await authService.findOrCreateUser({
    firebaseUid: decoded.uid,
    email: decoded.email || `${decoded.uid}@guest.localgo.vn`,
    displayName: decoded.name || 'LocalGo User',
    avatar: decoded.picture,
  });

  // Save FCM token if provided
  if (fcmToken) {
    await authService.updateFcmToken(user._id.toString(), fcmToken);
  }

  sendSuccess(res, { user }, 'Login successful', 200);
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await authService.getUserProfile(req.user!._id);
  sendSuccess(res, { user });
});

export const updateFcmToken = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { token } = req.body as { token: string };
  if (!token) throw new ValidationError('FCM token is required');
  await authService.updateFcmToken(req.user!._id, token);
  sendSuccess(res, null, 'FCM token updated');
});

export const deleteAccount = asyncHandler(async (req: AuthRequest, res: Response) => {
  await authService.deleteAccount(req.user!._id, req.user!.firebaseUid);
  sendSuccess(res, null, 'Account deleted successfully');
});

export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const allowedFields = [
    'displayName', 'bio', 'phone', 'gender', 'birthday',
    'travelInterests', 'language', 'theme', 'notificationsEnabled',
  ];

  const updateData: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  }

  // Handle avatar upload
  if (req.file) {
    updateData.avatar = (req.file as Express.Multer.File & { path: string }).path;
  }

  const user = await User.findByIdAndUpdate(
    req.user!._id,
    updateData,
    { new: true, runValidators: true },
  );

  sendSuccess(res, { user }, 'Profile updated successfully');
});
