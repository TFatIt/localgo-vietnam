import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  userId: mongoose.Types.ObjectId;
  placeId: mongoose.Types.ObjectId;
  type: 'hotel' | 'homestay' | 'tour';
  checkInDate: Date;
  checkOutDate?: Date;
  guests: {
    adults: number;
    children: number;
  };
  totalAmount: number;
  currency: string;
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'cancelled';
  bookingStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  specialRequests?: string;
  confirmationCode: string;
  paymentMethod?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    placeId: { type: Schema.Types.ObjectId, ref: 'Place', required: true },
    type: { type: String, enum: ['hotel', 'homestay', 'tour'], required: true },
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date },
    guests: {
      adults: { type: Number, default: 1, min: 1 },
      children: { type: Number, default: 0, min: 0 },
    },
    totalAmount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'VND' },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded', 'cancelled'],
      default: 'pending',
    },
    bookingStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
    specialRequests: { type: String, maxlength: 500 },
    confirmationCode: { type: String, required: true, unique: true },
    paymentMethod: { type: String },
  },
  { timestamps: true },
);

BookingSchema.index({ userId: 1, createdAt: -1 });
BookingSchema.index({ confirmationCode: 1 });

export const Booking = mongoose.model<IBooking>('Booking', BookingSchema);
