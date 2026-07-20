import mongoose, { Document, Schema } from 'mongoose';

export interface IJournalEntry {
  date: Date;
  title: string;
  content: string;
  mood: 'amazing' | 'happy' | 'neutral' | 'sad' | 'terrible';
  photos: string[];
  videos: string[];
  placesVisited: mongoose.Types.ObjectId[];
  expenses: Array<{
    category: string;
    amount: number;
    currency: string;
    note?: string;
  }>;
  weather?: string;
  location?: string;
}

export interface IJournal extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  coverImage?: string;
  destination: string;
  startDate: Date;
  endDate?: Date;
  entries: IJournalEntry[];
  totalExpenses: number;
  currency: string;
  isPublic: boolean;
  aiGeneratedStory?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const JournalEntrySchema = new Schema<IJournalEntry>({
  date: { type: Date, required: true },
  title: { type: String, required: true, maxlength: 200 },
  content: { type: String, maxlength: 5000 },
  mood: {
    type: String,
    enum: ['amazing', 'happy', 'neutral', 'sad', 'terrible'],
    default: 'happy',
  },
  photos: [{ type: String }],
  videos: [{ type: String }],
  placesVisited: [{ type: Schema.Types.ObjectId, ref: 'Place' }],
  expenses: [
    {
      category: String,
      amount: Number,
      currency: { type: String, default: 'VND' },
      note: String,
    },
  ],
  weather: String,
  location: String,
});

const JournalSchema = new Schema<IJournal>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, maxlength: 200 },
    description: { type: String, maxlength: 1000 },
    coverImage: { type: String },
    destination: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    entries: [JournalEntrySchema],
    totalExpenses: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'VND' },
    isPublic: { type: Boolean, default: false },
    aiGeneratedStory: { type: String, maxlength: 10000 },
    tags: [{ type: String }],
  },
  { timestamps: true },
);

JournalSchema.index({ userId: 1, createdAt: -1 });
JournalSchema.index({ isPublic: 1 });

export const Journal = mongoose.model<IJournal>('Journal', JournalSchema);
