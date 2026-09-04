import { Request, Response, NextFunction } from 'express';
import { admin } from '../config/firebase';
import { User } from '../models/User';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { asyncHandler } from '../utils/helpers';

export interface AuthRequest extends Request {
  user?: {
    _id: string;
    firebaseUid: string;
    email: string;
    role: 'user' | 'admin' | 'business';
    displayName: string;
  };
}

/**
 * Verifies Firebase ID token and attaches user to request.
 */
export const authenticate = asyncHandler(
  async (req: AuthRequest, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('No authorization token provided');
    }

    const idToken = authHeader.split('Bearer ')[1];

    // Development bypass for easy testing (e.g. from Admin dashboard or Postman)
    if (config.env !== 'production' && (idToken === 'dev-token' || idToken === 'dev-admin-token' || idToken === 'admin_token')) {
      req.user = {
        _id: '65e000000000000000000001',
        firebaseUid: 'dev_admin_uid',
        email: 'admin@localgo.vn',
        role: 'admin',
        displayName: 'Dev Administrator',
      };
      return next();
    }

    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch {
      throw new UnauthorizedError('Invalid or expired token');
    }

    const user = await User.findOne({ firebaseUid: decodedToken.uid }).select(
      '_id firebaseUid email role displayName isActive',
    );

    if (!user) {
      throw new UnauthorizedError('User not found. Please complete registration.');
    }

    if (!user.isActive) {
      throw new ForbiddenError('Your account has been suspended.');
    }

    req.user = {
      _id: user._id.toString(),
      firebaseUid: user.firebaseUid,
      email: user.email,
      role: user.role,
      displayName: user.displayName,
    };

    next();
  },
);

/**
 * Allows optional authentication (guest access supported).
 */
export const optionalAuthenticate = asyncHandler(
  async (req: AuthRequest, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return next();

    try {
      const idToken = authHeader.split('Bearer ')[1];
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const user = await User.findOne({ firebaseUid: decodedToken.uid }).select(
        '_id firebaseUid email role displayName isActive',
      );
      if (user?.isActive) {
        req.user = {
          _id: user._id.toString(),
          firebaseUid: user.firebaseUid,
          email: user.email,
          role: user.role,
          displayName: user.displayName,
        };
      }
    } catch {
      // Ignore auth errors for optional auth
    }
    next();
  },
);

/**
 * Restricts route to specific roles.
 */
export const authorize =
  (...roles: Array<'user' | 'admin' | 'business'>) =>
  (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError('You do not have permission to access this resource');
    }
    next();
  };
