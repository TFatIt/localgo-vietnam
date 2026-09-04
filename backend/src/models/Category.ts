import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  nameEn: string;
  slug: string;
  icon: string;
  emoji: string;
  color: string;
  description?: string;
  parentCategory?: mongoose.Types.ObjectId;
  order: number;
  isActive: boolean;
  placesCount: number;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    nameEn: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    icon: { type: String, required: true },
    emoji: { type: String, default: '📍' },
    color: { type: String, default: '#FF6B35' },
    description: { type: String },
    parentCategory: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    placesCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

CategorySchema.index({ slug: 1 });
CategorySchema.index({ parentCategory: 1 });
CategorySchema.index({ order: 1 });

export const Category = mongoose.model<ICategory>('Category', CategorySchema);
