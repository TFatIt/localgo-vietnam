import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { Review } from '../models/Review';
import { placeService } from '../services/place.service';
import { asyncHandler, sendSuccess, sendPaginated } from '../utils/helpers';
import { NotFoundError, ForbiddenError, ConflictError } from '../utils/errors';

export const getPlaceReviews = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = '1', limit = '10' } = req.query as Record<string, string>;
  const p = parseInt(page);
  const l = parseInt(limit);

  const [reviews, total] = await Promise.all([
    Review.find({ placeId: req.params.placeId, isHidden: false })
      .populate('userId', 'displayName avatar level')
      .sort('-createdAt')
      .skip((p - 1) * l)
      .limit(l)
      .lean(),
    Review.countDocuments({ placeId: req.params.placeId, isHidden: false }),
  ]);

  sendPaginated(res, reviews, total, p, l);
});

export const createReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { placeId } = req.params;

  // Check for duplicate
  const existing = await Review.findOne({ placeId, userId: req.user!._id });
  if (existing) throw new ConflictError('You have already reviewed this place');

  const photos = (req.files as Express.Multer.File[])?.map(
    (f) => (f as Express.Multer.File & { path: string }).path,
  ) || [];

  const review = await Review.create({
    placeId,
    userId: req.user!._id,
    rating: req.body.rating,
    title: req.body.title,
    body: req.body.body,
    photos,
    travelType: req.body.travelType,
    visitDate: req.body.visitDate,
  });

  // Recalculate place rating
  await placeService.updateRating(placeId);

  const populated = await Review.findById(review._id)
    .populate('userId', 'displayName avatar level');

  sendSuccess(res, { review: populated }, 'Review submitted', 201);
});

export const updateReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new NotFoundError('Review not found');
  if (review.userId.toString() !== req.user!._id) throw new ForbiddenError();

  const updated = await Review.findByIdAndUpdate(
    req.params.id,
    { rating: req.body.rating, title: req.body.title, body: req.body.body },
    { new: true },
  ).populate('userId', 'displayName avatar');

  await placeService.updateRating(review.placeId.toString());

  sendSuccess(res, { review: updated }, 'Review updated');
});

export const deleteReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new NotFoundError('Review not found');
  if (review.userId.toString() !== req.user!._id && req.user!.role !== 'admin') {
    throw new ForbiddenError();
  }

  const placeId = review.placeId.toString();
  await review.deleteOne();
  await placeService.updateRating(placeId);

  sendSuccess(res, null, 'Review deleted');
});

export const voteHelpful = asyncHandler(async (req: AuthRequest, res: Response) => {
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { $inc: { helpfulCount: 1 } },
    { new: true },
  );
  if (!review) throw new NotFoundError('Review not found');
  sendSuccess(res, { helpfulCount: review.helpfulCount });
});
