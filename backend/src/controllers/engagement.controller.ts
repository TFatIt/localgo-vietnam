import { Response } from 'express';
<parameter name="CodeContent">import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { Bookmark, Favorite } from '../models/Engagement';
import { Place } from '../models/Place';
import { User } from '../models/User';
import { asyncHandler, sendSuccess, sendPaginated } from '../utils/helpers';

// --- Bookmarks ---
export const getBookmarks = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = '1', limit = '20', folder } = req.query as Record<string, string>;
  const p = parseInt(page), l = parseInt(limit);
  const filter: Record<string, unknown> = { userId: req.user!._id };
  if (folder) filter.folderId = folder;

  const [bookmarks, total] = await Promise.all([
    Bookmark.find(filter)
      .populate({ path: 'placeId', select: 'name province coverImage category communityRating' })
      .sort('-createdAt')
      .skip((p - 1) * l)
      .limit(l)
      .lean(),
    Bookmark.countDocuments(filter),
  ]);

  sendPaginated(res, bookmarks, total, p, l);
});

export const toggleBookmark = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { placeId } = req.params;
  const existing = await Bookmark.findOne({ userId: req.user!._id, placeId });

  if (existing) {
    await existing.deleteOne();
    await Place.findByIdAndUpdate(placeId, { $inc: { saveCount: -1 } });
    sendSuccess(res, { isBookmarked: false }, 'Bookmark removed');
  } else {
    await Bookmark.create({ userId: req.user!._id, placeId, folderId: req.body.folder || 'default' });
    await Place.findByIdAndUpdate(placeId, { $inc: { saveCount: 1 } });
    sendSuccess(res, { isBookmarked: true }, 'Place bookmarked');
  }
});

// --- Favorites ---
export const getFavorites = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = '1', limit = '20' } = req.query as Record<string, string>;
  const p = parseInt(page), l = parseInt(limit);

  const [favorites, total] = await Promise.all([
    Favorite.find({ userId: req.user!._id })
      .populate({ path: 'placeId', select: 'name province coverImage category communityRating' })
      .sort('-createdAt')
      .skip((p - 1) * l)
      .limit(l)
      .lean(),
    Favorite.countDocuments({ userId: req.user!._id }),
  ]);

  sendPaginated(res, favorites, total, p, l);
});

export const toggleFavorite = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { placeId } = req.params;
  const existing = await Favorite.findOne({ userId: req.user!._id, placeId });

  if (existing) {
    await existing.deleteOne();
    await User.findByIdAndUpdate(req.user!._id, { $pull: { favoritePlaces: placeId } });
    sendSuccess(res, { isFavorite: false }, 'Removed from favorites');
  } else {
    await Favorite.create({ userId: req.user!._id, placeId });
    await User.findByIdAndUpdate(req.user!._id, { $addToSet: { favoritePlaces: placeId } });
    sendSuccess(res, { isFavorite: true }, 'Added to favorites');
  }
});
