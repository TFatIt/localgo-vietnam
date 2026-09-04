import mongoose, { Document, Schema } from 'mongoose';

// --- Bookmark ---
export interface IBookmark extends Document {
  userId: mongoose.Types.ObjectId;
  placeId: mongoose.Types.ObjectId;
  folderId?: string;
  note?: string;
  createdAt: Date;
}

const BookmarkSchema = new Schema<IBookmark>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    placeId: { type: Schema.Types.ObjectId, ref: 'Place', required: true },
    folderId: { type: String, default: 'default' },
    note: { type: String, maxlength: 300 },
  },
  { timestamps: true },
);

BookmarkSchema.index({ userId: 1, placeId: 1 }, { unique: true });
BookmarkSchema.index({ userId: 1, folderId: 1 });

export const Bookmark = mongoose.model<IBookmark>('Bookmark', BookmarkSchema);

// --- Favorite ---
export interface IFavorite extends Document {
  userId: mongoose.Types.ObjectId;
  placeId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const FavoriteSchema = new Schema<IFavorite>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    placeId: { type: Schema.Types.ObjectId, ref: 'Place', required: true },
  },
  { timestamps: true },
);

FavoriteSchema.index({ userId: 1, placeId: 1 }, { unique: true });

export const Favorite = mongoose.model<IFavorite>('Favorite', FavoriteSchema);

// --- Like ---
export interface ILike extends Document {
  userId: mongoose.Types.ObjectId;
  targetType: 'post' | 'comment' | 'review';
  targetId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const LikeSchema = new Schema<ILike>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: ['post', 'comment', 'review'], required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
  },
  { timestamps: true },
);

LikeSchema.index({ userId: 1, targetType: 1, targetId: 1 }, { unique: true });
LikeSchema.index({ targetType: 1, targetId: 1 });

export const Like = mongoose.model<ILike>('Like', LikeSchema);
