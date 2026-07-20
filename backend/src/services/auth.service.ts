import { User, IUser } from '../models/User';
import { admin } from '../config/firebase';
import { NotFoundError, ConflictError } from '../utils/errors';
import { logger } from '../utils/logger';

export interface CreateUserDto {
  firebaseUid: string;
  email: string;
  displayName: string;
  avatar?: string;
  phone?: string;
}

export interface UpdateUserDto {
  displayName?: string;
  bio?: string;
  phone?: string;
  gender?: IUser['gender'];
  birthday?: Date;
  travelInterests?: string[];
  language?: 'vi' | 'en';
  theme?: 'light' | 'dark' | 'system';
  notificationsEnabled?: boolean;
}

export class AuthService {
  /**
   * Creates a new user from Firebase data or returns existing user.
   */
  async findOrCreateUser(data: CreateUserDto): Promise<IUser> {
    let user = await User.findOne({ firebaseUid: data.firebaseUid });

    if (!user) {
      // Check if email already exists (different Firebase UID)
      const emailExists = await User.findOne({ email: data.email.toLowerCase() });
      if (emailExists) {
        // Link the Firebase UID to existing account
        emailExists.firebaseUid = data.firebaseUid;
        if (!emailExists.avatar && data.avatar) emailExists.avatar = data.avatar;
        await emailExists.save();
        return emailExists;
      }

      user = await User.create({
        firebaseUid: data.firebaseUid,
        email: data.email.toLowerCase(),
        displayName: data.displayName || 'LocalGo User',
        avatar: data.avatar || null,
        isEmailVerified: true,
      });

      logger.info(`New user created: ${user.email} (${user.firebaseUid})`);
    } else {
      // Update last login
      user.lastLoginAt = new Date();
      if (data.avatar && !user.avatar) user.avatar = data.avatar;
      await user.save();
    }

    return user;
  }

  async getUserProfile(userId: string): Promise<IUser> {
    const user = await User.findById(userId).populate('badges', 'name icon color rarity');
    if (!user) throw new NotFoundError('User not found');
    return user;
  }

  async updateFcmToken(userId: string, token: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $addToSet: { fcmTokens: token },
    });
  }

  async removeFcmToken(userId: string, token: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $pull: { fcmTokens: token },
    });
  }

  async deleteAccount(userId: string, firebaseUid: string): Promise<void> {
    // Delete from Firebase
    await admin.auth().deleteUser(firebaseUid);
    // Soft delete from MongoDB
    await User.findByIdAndUpdate(userId, {
      isActive: false,
      email: `deleted_${Date.now()}_${userId}@deleted.com`,
      displayName: 'Deleted User',
      avatar: null,
    });
    logger.info(`Account deleted for user ${userId}`);
  }
}

export const authService = new AuthService();
