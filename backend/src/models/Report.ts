import mongoose, { Document, Schema } from 'mongoose';

export interface IReport extends Document {
  reporterId: mongoose.Types.ObjectId;
  targetType: 'place' | 'post' | 'review' | 'comment' | 'user';
  targetId: mongoose.Types.ObjectId;
  reason: string;
  details?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reviewedBy?: mongoose.Types.ObjectId;
  resolution?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: {
      type: String,
      enum: ['place', 'post', 'review', 'comment', 'user'],
      required: true,
    },
    targetId: { type: Schema.Types.ObjectId, required: true },
    reason: { type: String, required: true, maxlength: 200 },
    details: { type: String, maxlength: 1000 },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
      default: 'pending',
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    resolution: { type: String, maxlength: 500 },
  },
  { timestamps: true },
);

ReportSchema.index({ status: 1, createdAt: -1 });
ReportSchema.index({ targetType: 1, targetId: 1 });

export const Report = mongoose.model<IReport>('Report', ReportSchema);

// --- Weather Cache ---
export interface IWeatherCache extends Document {
  locationKey: string; // lat,lng or city name
  data: Record<string, unknown>;
  cachedAt: Date;
}

const WeatherCacheSchema = new Schema<IWeatherCache>({
  locationKey: { type: String, required: true, unique: true },
  data: { type: Schema.Types.Mixed, required: true },
  cachedAt: { type: Date, default: Date.now, expires: 3600 }, // TTL: 1 hour
});

export const WeatherCache = mongoose.model<IWeatherCache>('WeatherCache', WeatherCacheSchema);
