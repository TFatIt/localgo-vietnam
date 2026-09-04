import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  placeId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  rating: number;
  title?: string;
  body: string;
  photos: string[];
  videos: string[];
  visitDate?: Date;
  travelType?: 'solo' | 'couple' | 'family' | 'friends' | 'business';
  helpfulCount: number;
  reportCount: number;
  isVerified: boolean;
  isHidden: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    placeId: { type: Schema.Types.ObjectId, ref: 'Place', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, trim: true, maxlength: 200 },
    body: { type: String, required: true, trim: true, maxlength: 2000 },
    photos: [{ type: String }],
    videos: [{ type: String }],
    visitDate: { type: Date },
    travelType: {
      type: String,
      enum: ['solo', 'couple', 'family', 'friends', 'business'],
    },
    helpfulCount: { type: Number, default: 0, min: 0 },
    reportCount: { type: Number, default: 0, min: 0 },
    isVerified: { type: Boolean, default: false },
    isHidden: { type: Boolean, default: false },
  },
  { timestamps: true },
);

ReviewSchema.index({ placeId: 1, createdAt: -1 });
ReviewSchema.index({ userId: 1, createdAt: -1 });
ReviewSchema.index({ rating: -1 });
ReviewSchema.index({ placeId: 1, userId: 1 }, { unique: true }); // One review per user per place

export const Review = mongoose.model<IReview>('Review', ReviewSchema);
