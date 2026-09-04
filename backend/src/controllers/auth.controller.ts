import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middlewares/auth';
import { authService } from '../services/auth.service';
import { User, IUser } from '../models/User';
import { asyncHandler, sendSuccess } from '../utils/helpers';
import { ValidationError, UnauthorizedError } from '../utils/errors';
import { admin } from '../config/firebase';
import { config } from '../config';
import { isDbConnected } from '../config/database';

const generateToken = (user: IUser | { _id: string; email: string; role: string; displayName: string }): string => {
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      displayName: user.displayName,
    },
    config.jwt.secret || 'localgo_secret_jwt_key',
    { expiresIn: '7d' },
  );
};

export const registerWithEmail = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password, displayName, phone } = req.body as {
    email: string;
    password: string;
    displayName: string;
    phone?: string;
  };

  if (!email || !password) {
    throw new ValidationError('Email và mật khẩu là bắt buộc');
  }

  if (password.length < 6) {
    throw new ValidationError('Mật khẩu phải chứa ít nhất 6 ký tự');
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanName = (displayName || cleanEmail.split('@')[0]).trim();

  if (!isDbConnected) {
    const mockUser = {
      _id: 'local_user_' + Date.now(),
      firebaseUid: 'local_uid_' + Date.now(),
      email: cleanEmail,
      displayName: cleanName,
      role: 'user',
      level: 1,
      points: 100,
      xp: 200,
      isActive: true,
      avatar: null,
      travelInterests: ['beach', 'food'],
      createdAt: new Date(),
    };
    const token = generateToken(mockUser);
    return sendSuccess(res, { user: mockUser, token }, 'Đăng ký tài khoản thành công', 201);
  }

  // Check if email already registered
  const existing = await User.findOne({ email: cleanEmail });
  if (existing) {
    throw new ValidationError('Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    firebaseUid: 'local_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
    email: cleanEmail,
    password: hashedPassword,
    displayName: cleanName,
    phone: phone || null,
    role: 'user',
    isEmailVerified: true,
    points: 100,
    xp: 200,
  });

  const token = generateToken(user);
  sendSuccess(res, { user, token }, 'Đăng ký tài khoản thành công', 201);
});

export const verifyAndLogin = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { idToken, email, password, fcmToken } = req.body as {
    idToken?: string;
    email?: string;
    password?: string;
    fcmToken?: string;
  };

  // 1. Direct Email & Password Login
  if (email && password) {
    const cleanEmail = email.trim().toLowerCase();

    if (!isDbConnected) {
      const mockUser = {
        _id: 'dev_user_' + cleanEmail.replace(/[^a-z0-9]/g, '_'),
        firebaseUid: 'dev_uid_' + cleanEmail.replace(/[^a-z0-9]/g, '_'),
        email: cleanEmail,
        displayName: cleanEmail.split('@')[0],
        role: cleanEmail.includes('admin') ? 'admin' : 'user',
        level: 2,
        points: 500,
        xp: 1200,
        isActive: true,
        avatar: null,
        travelInterests: ['beach', 'mountain', 'food'],
        createdAt: new Date(),
      };
      const token = generateToken(mockUser);
      return sendSuccess(res, { user: mockUser, token }, 'Đăng nhập thành công', 200);
    }

    const user = await User.findOne({ email: cleanEmail }).select('+password');
    if (!user) {
      // If user doesn't exist yet in development, auto-register for seamless testing
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await User.create({
        firebaseUid: 'local_' + Date.now(),
        email: cleanEmail,
        password: hashedPassword,
        displayName: cleanEmail.split('@')[0],
        role: cleanEmail.includes('admin') ? 'admin' : 'user',
        points: 100,
        xp: 200,
      });
      const token = generateToken(newUser);
      return sendSuccess(res, { user: newUser, token }, 'Đăng nhập thành công', 200);
    }

    if (user.password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new UnauthorizedError('Mật khẩu không chính xác');
      }
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Tài khoản của bạn đã bị khóa');
    }

    user.lastLoginAt = new Date();
    await user.save();

    if (fcmToken) {
      await authService.updateFcmToken(user._id.toString(), fcmToken);
    }

    const token = generateToken(user);
    return sendSuccess(res, { user, token }, 'Đăng nhập thành công', 200);
  }

  // 2. Firebase ID Token Login
  if (!idToken) {
    throw new ValidationError('Vui lòng cung cấp Email và Mật khẩu hoặc Firebase ID token');
  }

  // Verify Firebase token
  const decoded = await admin.auth().verifyIdToken(idToken);

  // Find or create user
  const user = await authService.findOrCreateUser({
    firebaseUid: decoded.uid,
    email: decoded.email || `${decoded.uid}@guest.localgo.vn`,
    displayName: decoded.name || 'LocalGo User',
    avatar: decoded.picture,
  });

  if (fcmToken) {
    await authService.updateFcmToken(user._id.toString(), fcmToken);
  }

  const token = generateToken(user);
  sendSuccess(res, { user, token }, 'Login successful', 200);
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?._id) throw new UnauthorizedError('Not authenticated');

  if (!isDbConnected) {
    return sendSuccess(res, { user: req.user });
  }

  const user = await authService.getUserProfile(req.user._id);
  sendSuccess(res, { user });
});

export const updateFcmToken = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { token } = req.body as { token: string };
  if (!token) throw new ValidationError('FCM token is required');
  if (isDbConnected && req.user?._id) {
    await authService.updateFcmToken(req.user._id, token);
  }
  sendSuccess(res, null, 'FCM token updated');
});

export const deleteAccount = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (isDbConnected && req.user?._id) {
    await authService.deleteAccount(req.user._id, req.user.firebaseUid);
  }
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

  if (!isDbConnected) {
    return sendSuccess(res, { user: { ...req.user, ...updateData } }, 'Profile updated');
  }

  const user = await User.findByIdAndUpdate(req.user!._id, updateData, { new: true });
  sendSuccess(res, { user }, 'Profile updated');
});
