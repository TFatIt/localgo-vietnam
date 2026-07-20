import mongoose, { Document, Schema } from 'mongoose';

export type PlaceCategory =
  | 'beach'
  | 'mountain'
  | 'camping'
  | 'temple'
  | 'historical'
  | 'waterfall'
  | 'village'
  | 'cafe'
  | 'restaurant'
  | 'night_market'
  | 'national_park'
  | 'hotel'
  | 'homestay'
  | 'other';

export interface IPlace extends Document {
  name: string;
  nameEn?: string;
  slug: string;
  description: string;
  descriptionEn?: string;
  history?: string;
  category: PlaceCategory;
  subcategories: string[];
  province: string;
  district?: string;
  address: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  images: string[];
  videos: string[];
  droneVideos: string[];
  coverImage: string;
  openingHours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  ticketPrice?: {
    adult?: number;
    child?: number;
    currency: string;
  };
  facilities: string[];
  travelTips: string[];
  bestVisitingSeason: string[];
  weather?: string;
  googlePlaceId?: string;
  googleRating?: number;
  communityRating: number;
  reviewCount: number;
  checkinCount: number;
  saveCount: number;
  isHiddenGem: boolean;
  isTrending: boolean;
  isVerified: boolean;
  isActive: boolean;
  tags: string[];
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PlaceSchema = new Schema<IPlace>(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    nameEn: { type: String, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true, maxlength: 5000 },
    descriptionEn: { type: String, maxlength: 5000 },
    history: { type: String, maxlength: 10000 },
    category: {
      type: String,
      required: true,
      enum: [
        'beach', 'mountain', 'camping', 'temple', 'historical',
        'waterfall', 'village', 'cafe', 'restaurant', 'night_market',
        'national_park', 'hotel', 'homestay', 'other',
      ],
    },
    subcategories: [{ type: String }],
    province: { type: String, required: true, trim: true },
    district: { type: String, trim: true },
    address: { type: String, required: true },
    location: {
      type: { type: String, enum: ['Point'], required: true, default: 'Point' },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    images: [{ type: String }],
    videos: [{ type: String }],
    droneVideos: [{ type: String }],
    coverImage: { type: String, default: '' },
    openingHours: {
      monday: String,
      tuesday: String,
      wednesday: String,
      thursday: String,
      friday: String,
      saturday: String,
      sunday: String,
    },
    ticketPrice: {
      adult: Number,
      child: Number,
      currency: { type: String, default: 'VND' },
    },
    facilities: [{ type: String }],
    travelTips: [{ type: String }],
    bestVisitingSeason: [{ type: String }],
    weather: { type: String },
    googlePlaceId: { type: String, index: true },
    googleRating: { type: Number, min: 0, max: 5 },
    communityRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    checkinCount: { type: Number, default: 0, min: 0 },
    saveCount: { type: Number, default: 0, min: 0 },
    isHiddenGem: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    tags: [{ type: String }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Geospatial index for nearby queries
PlaceSchema.index({ location: '2dsphere' });
PlaceSchema.index({ province: 1, category: 1 });
PlaceSchema.index({ slug: 1 });
PlaceSchema.index({ isHiddenGem: 1 });
PlaceSchema.index({ isTrending: 1 });
PlaceSchema.index({ communityRating: -1 });
PlaceSchema.index({ checkinCount: -1 });
PlaceSchema.index({ tags: 1 });
PlaceSchema.index({ name: 'text', description: 'text', tags: 'text' }); // Text search

export const Place = mongoose.model<IPlace>('Place', PlaceSchema);
