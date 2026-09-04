import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { placeService } from '../services/place.service';
import { Place } from '../models/Place';
import { asyncHandler, sendSuccess, sendPaginated } from '../utils/helpers';
import { NotFoundError, ForbiddenError } from '../utils/errors';
// Native Vietnamese-friendly slug generator
function generateSlugString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-');
}

// Helper to generate unique slug
async function generateSlug(name: string): Promise<string> {
  const base = generateSlugString(name) || 'place';
  let slug = base;
  let counter = 1;
  while (await Place.findOne({ slug })) {
    slug = `${base}-${counter++}`;
  }
  return slug;
}

export const getPlaces = asyncHandler(async (req: AuthRequest, res: Response) => {
  const {
    province, category, isHiddenGem, isTrending, search,
    minRating, page = '1', limit = '20', sortBy,
  } = req.query as Record<string, string>;

  const result = await placeService.getPlaces({
    province,
    category,
    isHiddenGem: isHiddenGem === 'true' ? true : isHiddenGem === 'false' ? false : undefined,
    isTrending: isTrending === 'true' ? true : undefined,
    search,
    minRating: minRating ? parseFloat(minRating) : undefined,
    page: parseInt(page),
    limit: Math.min(parseInt(limit), 50),
    sortBy,
  });

  sendPaginated(res, result.places, result.total, result.page, result.limit);
});

export const getPlaceById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const place = await placeService.getPlaceById(req.params.id, req.user?._id);
  sendSuccess(res, { place });
});

export const getNearbyPlaces = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { lat, lng, radius, category, limit } = req.query as Record<string, string>;
  const places = await placeService.getNearbyPlaces({
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    radiusKm: radius ? parseFloat(radius) : 10,
    category,
    limit: limit ? parseInt(limit) : 20,
  });
  sendSuccess(res, { places });
});

export const getTrending = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const places = await placeService.getTrending(10);
  sendSuccess(res, { places });
});

export const getHiddenGems = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { province, limit } = req.query as Record<string, string>;
  const places = await placeService.getHiddenGems(province, limit ? parseInt(limit) : 10);
  sendSuccess(res, { places });
});

export const createPlace = asyncHandler(async (req: AuthRequest, res: Response) => {
  const images = (req.files as Express.Multer.File[])?.map(
    (f) => (f as Express.Multer.File & { path: string }).path,
  ) || [];

  const slug = await generateSlug(req.body.name);

  const place = await Place.create({
    ...req.body,
    slug,
    images,
    coverImage: images[0] || '',
    createdBy: req.user!._id,
    location: {
      type: 'Point',
      coordinates: [parseFloat(req.body.lng), parseFloat(req.body.lat)],
    },
  });

  sendSuccess(res, { place }, 'Place created successfully', 201);
});

export const updatePlace = asyncHandler(async (req: AuthRequest, res: Response) => {
  const place = await Place.findById(req.params.id);
  if (!place) throw new NotFoundError('Place not found');

  if (
    place.createdBy.toString() !== req.user!._id &&
    req.user!.role !== 'admin'
  ) {
    throw new ForbiddenError('You cannot edit this place');
  }

  const updated = await Place.findByIdAndUpdate(
    req.params.id,
    { ...req.body, updatedBy: req.user!._id },
    { new: true, runValidators: true },
  );

  sendSuccess(res, { place: updated }, 'Place updated');
});
