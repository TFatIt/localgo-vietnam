import mongoose, { Document, Schema } from 'mongoose';

export interface IPost extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'photo' | 'video' | 'story';
  content: string;
  media: string[];
  thumbnail?: string;
  placeId?: mongoose.Types.ObjectId;
  location?: {
    type: 'Point';
    coordinates: [number, number];
    name?: string;
  };
  tags: string[];
  mentionedUsers: mongoose.Types.ObjectId[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  viewsCount: number;
  isPublic: boolean;
  isActive: boolean;
  expiresAt?: Date; // For stories
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['photo', 'video', 'story'], required: true },
    content: { type: String, maxlength: 2000, default: '' },
    media: [{ type: String }],
    thumbnail: { type: String },
    placeId: { type: Schema.Types.ObjectId, ref: 'Place' },
    location: {
      type: { type: String, enum: ['Point'] },
      coordinates: [Number],
      name: String,
    },
    tags: [{ type: String }],
    mentionedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    likesCount: { type: Number, default: 0, min: 0 },
    commentsCount: { type: Number, default: 0, min: 0 },
    sharesCount: { type: Number, default: 0, min: 0 },
    viewsCount: { type: Number, default: 0, min: 0 },
    isPublic: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true },
);

PostSchema.index({ userId: 1, createdAt: -1 });
PostSchema.index({ type: 1, createdAt: -1 });
PostSchema.index({ placeId: 1 });
PostSchema.index({ tags: 1 });
PostSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL for stories
PostSchema.index({ location: '2dsphere' });

export const Post = mongoose.model<IPost>('Post', PostSchema);
