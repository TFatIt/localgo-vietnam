import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  fromUserId?: mongoose.Types.ObjectId;
  type:
    | 'like'
    | 'comment'
    | 'follow'
    | 'mention'
    | 'review'
    | 'checkin'
    | 'badge'
    | 'system'
    | 'promo';
  title: string;
  body: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  imageUrl?: string;
  deepLink?: string;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fromUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    type: {
      type: String,
      enum: ['like', 'comment', 'follow', 'mention', 'review', 'checkin', 'badge', 'system', 'promo'],
      required: true,
    },
    title: { type: String, required: true, maxlength: 200 },
    body: { type: String, required: true, maxlength: 500 },
    data: { type: Schema.Types.Mixed },
    isRead: { type: Boolean, default: false, index: true },
    imageUrl: { type: String },
    deepLink: { type: String },
  },
  { timestamps: true },
);

NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, isRead: 1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
