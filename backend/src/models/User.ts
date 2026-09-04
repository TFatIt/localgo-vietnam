import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  firebaseUid: string;
  email: string;
  password?: string;
  displayName: string;
  avatar?: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  birthday?: Date;
  bio?: string;
  role: 'user' | 'admin' | 'business';
  travelInterests: string[];
  favoritePlaces: mongoose.Types.ObjectId[];
  visitedPlaces: mongoose.Types.ObjectId[];
  savedPlaces: mongoose.Types.ObjectId[];
  badges: mongoose.Types.ObjectId[];
  points: number;
  xp: number;
  level: number;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  visitedProvincesCount: number;
  totalDistanceTraveled: number;
  language: 'vi' | 'en';
  theme: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
  isActive: boolean;
  isEmailVerified: boolean;
  fcmTokens: string[];
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      default: null,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    avatar: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say'],
      default: null,
    },
    birthday: {
      type: Date,
      default: null,
    },
    bio: {
      type: String,
      maxlength: 500,
      default: '',
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'business'],
      default: 'user',
    },
    travelInterests: [{ type: String }],
    favoritePlaces: [{ type: Schema.Types.ObjectId, ref: 'Place' }],
    visitedPlaces: [{ type: Schema.Types.ObjectId, ref: 'Place' }],
    savedPlaces: [{ type: Schema.Types.ObjectId, ref: 'Place' }],
    badges: [{ type: Schema.Types.ObjectId, ref: 'Badge' }],
    points: { type: Number, default: 0, min: 0 },
    xp: { type: Number, default: 0, min: 0 },
    level: { type: Number, default: 1, min: 1 },
    followersCount: { type: Number, default: 0, min: 0 },
    followingCount: { type: Number, default: 0, min: 0 },
    postsCount: { type: Number, default: 0, min: 0 },
    visitedProvincesCount: { type: Number, default: 0, min: 0 },
    totalDistanceTraveled: { type: Number, default: 0, min: 0 },
    language: { type: String, enum: ['vi', 'en'], default: 'vi' },
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    notificationsEnabled: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    fcmTokens: [{ type: String }],
    lastLoginAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ firebaseUid: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ points: -1 });
UserSchema.index({ createdAt: -1 });

export const User = mongoose.model<IUser>('User', UserSchema);
