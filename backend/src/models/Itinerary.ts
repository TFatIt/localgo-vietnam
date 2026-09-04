import mongoose, { Document, Schema } from 'mongoose';

export interface IItineraryDay {
  day: number;
  date?: Date;
  title: string;
  timeline: Array<{
    time: string;
    activity: string;
    placeId?: mongoose.Types.ObjectId;
    placeName?: string;
    duration?: string;
    cost?: number;
    notes?: string;
    type: 'attraction' | 'meal' | 'hotel' | 'transport' | 'other';
  }>;
  estimatedCost: number;
  accommodation?: {
    name: string;
    placeId?: mongoose.Types.ObjectId;
    cost: number;
  };
}

export interface IItinerary extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  destination: string;
  startDate?: Date;
  numberOfDays: number;
  budget: number;
  currency: string;
  transportation: string[];
  travelStyle: string;
  companions: string;
  foodPreference: string[];
  days: IItineraryDay[];
  totalEstimatedCost: number;
  packingChecklist: string[];
  weatherAdvice: string;
  aiPrompt?: string;
  isAiGenerated: boolean;
  isPublic: boolean;
  pdfUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ItineraryDaySchema = new Schema<IItineraryDay>({
  day: { type: Number, required: true },
  date: Date,
  title: { type: String, required: true },
  timeline: [
    {
      time: String,
      activity: String,
      placeId: { type: Schema.Types.ObjectId, ref: 'Place' },
      placeName: String,
      duration: String,
      cost: Number,
      notes: String,
      type: {
        type: String,
        enum: ['attraction', 'meal', 'hotel', 'transport', 'other'],
        default: 'attraction',
      },
    },
  ],
  estimatedCost: { type: Number, default: 0 },
  accommodation: {
    name: String,
    placeId: { type: Schema.Types.ObjectId, ref: 'Place' },
    cost: Number,
  },
});

const ItinerarySchema = new Schema<IItinerary>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    destination: { type: String, required: true },
    startDate: Date,
    numberOfDays: { type: Number, required: true, min: 1, max: 30 },
    budget: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'VND' },
    transportation: [{ type: String }],
    travelStyle: { type: String, default: 'moderate' },
    companions: { type: String, default: 'solo' },
    foodPreference: [{ type: String }],
    days: [ItineraryDaySchema],
    totalEstimatedCost: { type: Number, default: 0 },
    packingChecklist: [{ type: String }],
    weatherAdvice: { type: String, default: '' },
    aiPrompt: { type: String },
    isAiGenerated: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: false },
    pdfUrl: { type: String },
  },
  { timestamps: true },
);

ItinerarySchema.index({ userId: 1, createdAt: -1 });
ItinerarySchema.index({ destination: 1 });

export const Itinerary = mongoose.model<IItinerary>('Itinerary', ItinerarySchema);
