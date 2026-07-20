import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  postId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  parentCommentId?: mongoose.Types.ObjectId;
  content: string;
  media?: string;
  likesCount: number;
  repliesCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    parentCommentId: { type: Schema.Types.ObjectId, ref: 'Comment', default: null },
    content: { type: String, required: true, maxlength: 1000 },
    media: { type: String },
    likesCount: { type: Number, default: 0, min: 0 },
    repliesCount: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

CommentSchema.index({ postId: 1, createdAt: 1 });
CommentSchema.index({ parentCommentId: 1 });

export const Comment = mongoose.model<IComment>('Comment', CommentSchema);
