import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { CheckIn } from '../models/CheckIn';
import { Place } from '../models/Place';
import { User } from '../models/User';
import { PointTransaction } from '../models/Gamification';
import { asyncHandler, sendSuccess, sendPaginated } from '../utils/helpers';
import { ValidationError, NotFoundError } from '../utils/errors';

const CHECK_IN_RADIUS_METERS = 200; // Must be within 200m
const CHECKIN_POINTS = 10;
const CHECKIN_XP = 20;

export const checkIn = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { placeId, lat, lng, method = 'gps', photo, note } = req.body as {
    placeId: string;
    lat: number;
    lng: number;
    method?: 'gps' | 'qr';
    photo?: string;
    note?: string;
  };

  if (!placeId || !lat || !lng) {
    throw new ValidationError('placeId, lat, and lng are required');
  }

  const place = await Place.findById(placeId);
  if (!place) throw new NotFoundError('Place not found');

  // GPS Verification: check distance from place
  if (method === 'gps') {
    const nearbyPlaces = await Place.findOne({
      _id: placeId,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: CHECK_IN_RADIUS_METERS,
        },
      },
    });

    if (!nearbyPlaces) {
      throw new ValidationError(`You must be within ${CHECK_IN_RADIUS_METERS}m of the place to check in`);
    }
  }

  // Create check-in
  const checkIn = await CheckIn.create({
    userId: req.user!._id,
    placeId,
    gpsLocation: { type: 'Point', coordinates: [lng, lat] },
    verificationMethod: method,
    pointsEarned: CHECKIN_POINTS,
    xpEarned: CHECKIN_XP,
    photo,
    note,
    isVerified: true,
  });

  // Update place stats
  await Place.findByIdAndUpdate(placeId, { $inc: { checkinCount: 1 } });

  // Award points and XP
  const user = await User.findByIdAndUpdate(
    req.user!._id,
    {
      $inc: { points: CHECKIN_POINTS, xp: CHECKIN_XP },
      $addToSet: { visitedPlaces: placeId },
    },
    { new: true },
  );

  // Record point transaction
  await PointTransaction.create({
    userId: req.user!._id,
    action: 'checkin',
    amount: CHECKIN_POINTS,
    balance: user?.points || 0,
    referenceId: checkIn._id,
    referenceType: 'CheckIn',
  });

  sendSuccess(res, {
    checkIn,
    reward: { points: CHECKIN_POINTS, xp: CHECKIN_XP },
    totalPoints: user?.points,
  }, 'Check-in successful! Points awarded.', 201);
});

export const getMyCheckIns = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = '1', limit = '20' } = req.query as Record<string, string>;
  const p = parseInt(page);
  const l = parseInt(limit);

  const [checkIns, total] = await Promise.all([
    CheckIn.find({ userId: req.user!._id })
      .populate('placeId', 'name province coverImage category')
      .sort('-createdAt')
      .skip((p - 1) * l)
      .limit(l)
      .lean(),
    CheckIn.countDocuments({ userId: req.user!._id }),
  ]);

  sendPaginated(res, checkIns, total, p, l);
});

export const getLeaderboard = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const leaders = await User.find({ isActive: true })
    .select('displayName avatar points xp level visitedProvincesCount')
    .sort('-points')
    .limit(50)
    .lean();

  sendSuccess(res, { leaderboard: leaders });
});
