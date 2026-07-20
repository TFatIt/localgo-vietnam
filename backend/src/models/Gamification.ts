import mongoose, { Document, Schema } from 'mongoose';

// --- Badge ---
export interface IBadge extends Document {
  name: string;
  nameEn: string;
  description: string;
  icon: string;
  color: string;
  criteria: {
    type: 'checkins' | 'reviews' | 'posts' | 'provinces' | 'points' | 'custom';
    threshold: number;
    categoryFilter?: string;
  };
  xpReward: number;
  pointsReward: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isActive: boolean;
}

const BadgeSchema = new Schema<IBadge>(
  {
    name: { type: String, required: true, unique: true },
    nameEn: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    color: { type: String, default: '#FF6B35' },
    criteria: {
      type: {
        type: String,
        enum: ['checkins', 'reviews', 'posts', 'provinces', 'points', 'custom'],
        required: true,
      },
      threshold: { type: Number, required: true },
      categoryFilter: String,
    },
    xpReward: { type: Number, default: 100 },
    pointsReward: { type: Number, default: 50 },
    rarity: {
      type: String,
      enum: ['common', 'rare', 'epic', 'legendary'],
      default: 'common',
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Badge = mongoose.model<IBadge>('Badge', BadgeSchema);

// --- Points Transaction ---
export interface IPointTransaction extends Document {
  userId: mongoose.Types.ObjectId;
  action: string;
  amount: number;
  balance: number;
  referenceId?: mongoose.Types.ObjectId;
  referenceType?: string;
  createdAt: Date;
}

const PointTransactionSchema = new Schema<IPointTransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: { type: String, required: true },
    amount: { type: Number, required: true },
    balance: { type: Number, required: true },
    referenceId: { type: Schema.Types.ObjectId },
    referenceType: { type: String },
  },
  { timestamps: true },
);

PointTransactionSchema.index({ userId: 1, createdAt: -1 });

export const PointTransaction = mongoose.model<IPointTransaction>(
  'PointTransaction',
  PointTransactionSchema,
);

// --- Follower ---
export interface IFollower extends Document {
  followerId: mongoose.Types.ObjectId;
  followingId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const FollowerSchema = new Schema<IFollower>(
  {
    followerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    followingId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

FollowerSchema.index({ followerId: 1, followingId: 1 }, { unique: true });
FollowerSchema.index({ followingId: 1 });

export const Follower = mongoose.model<IFollower>('Follower', FollowerSchema);
