import mongoose, { Document, Schema } from 'mongoose';

export interface ICheckIn extends Document {
  userId: mongoose.Types.ObjectId;
  placeId: mongoose.Types.ObjectId;
  gpsLocation: {
    type: 'Point';
    coordinates: [number, number];
  };
  verificationMethod: 'gps' | 'qr';
  qrCode?: string;
  pointsEarned: number;
  xpEarned: number;
  photo?: string;
  note?: string;
  isVerified: boolean;
  createdAt: Date;
}

const CheckInSchema = new Schema<ICheckIn>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    placeId: { type: Schema.Types.ObjectId, ref: 'Place', required: true, index: true },
    gpsLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    verificationMethod: { type: String, enum: ['gps', 'qr'], required: true },
    qrCode: { type: String },
    pointsEarned: { type: Number, default: 10, min: 0 },
    xpEarned: { type: Number, default: 20, min: 0 },
    photo: { type: String },
    note: { type: String, maxlength: 500 },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

CheckInSchema.index({ gpsLocation: '2dsphere' });
CheckInSchema.index({ userId: 1, placeId: 1 });
CheckInSchema.index({ userId: 1, createdAt: -1 });

export const CheckIn = mongoose.model<ICheckIn>('CheckIn', CheckInSchema);
