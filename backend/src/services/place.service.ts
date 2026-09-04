import { Place } from '../models/Place';
import { Review } from '../models/Review';
import { Bookmark } from '../models/Engagement';
import { NotFoundError } from '../utils/errors';

export interface GetPlacesQuery {
  province?: string;
  category?: string;
  isHiddenGem?: boolean;
  isTrending?: boolean;
  search?: string;
  minRating?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
}

export interface NearbyQuery {
  lat: number;
  lng: number;
  radiusKm?: number;
  category?: string;
  limit?: number;
}

export class PlaceService {
  async getPlaces(query: GetPlacesQuery) {
    const {
      province,
      category,
      isHiddenGem,
      isTrending,
      search,
      minRating,
      page = 1,
      limit = 20,
      sortBy = '-createdAt',
    } = query;

    const filter: Record<string, unknown> = { isActive: true };

    if (province) filter.province = province;
    if (category) filter.category = category;
    if (isHiddenGem !== undefined) filter.isHiddenGem = isHiddenGem;
    if (isTrending !== undefined) filter.isTrending = isTrending;
    if (minRating) filter.communityRating = { $gte: minRating };
    if (search) filter.$text = { $search: search };

    const skip = (page - 1) * limit;

    const [places, total] = await Promise.all([
      Place.find(filter)
        .select('-history -travelTips')
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .lean(),
      Place.countDocuments(filter),
    ]);

    return { places, total, page, limit };
  }

  async getPlaceById(id: string, userId?: string) {
    const place = await Place.findById(id)
      .populate('createdBy', 'displayName avatar')
      .lean();

    if (!place || !place.isActive) throw new NotFoundError('Place not found');

    let isBookmarked = false;
    if (userId) {
      const bookmark = await Bookmark.findOne({ userId, placeId: id });
      isBookmarked = !!bookmark;
    }

    // Get recent reviews summary
    const reviews = await Review.find({ placeId: id, isHidden: false })
      .populate('userId', 'displayName avatar')
      .sort('-createdAt')
      .limit(5)
      .lean();

    return { ...place, isBookmarked, recentReviews: reviews };
  }

  async getNearbyPlaces(query: NearbyQuery) {
    const { lat, lng, radiusKm = 10, category, limit = 20 } = query;

    const filter: Record<string, unknown> = {
      isActive: true,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: radiusKm * 1000,
        },
      },
    };

    if (category) filter.category = category;

    const places = await Place.find(filter).limit(limit).lean();
    return places;
  }

  async getTrending(limit = 10) {
    return Place.find({ isActive: true, isTrending: true })
      .sort('-checkinCount -communityRating')
      .limit(limit)
      .lean();
  }

  async getHiddenGems(province?: string, limit = 10) {
    const filter: Record<string, unknown> = { isActive: true, isHiddenGem: true };
    if (province) filter.province = province;
    return Place.find(filter).sort('-communityRating').limit(limit).lean();
  }

  async updateRating(placeId: string): Promise<void> {
    const result = await Review.aggregate([
      { $match: { placeId: new (require('mongoose').Types.ObjectId)(placeId), isHidden: false } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    if (result.length > 0) {
      await Place.findByIdAndUpdate(placeId, {
        communityRating: Math.round(result[0].avgRating * 10) / 10,
        reviewCount: result[0].count,
      });
    }
  }
}

export const placeService = new PlaceService();
