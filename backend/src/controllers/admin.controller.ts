import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { User } from '../models/User';
import { Place } from '../models/Place';
import { Review } from '../models/Review';
import { Post } from '../models/Post';
import { CheckIn } from '../models/CheckIn';
import { Report } from '../models/Report';
import { asyncHandler, sendSuccess, sendPaginated } from '../utils/helpers';

export const getDashboardStats = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const [
    totalUsers,
    totalPlaces,
    totalReviews,
    totalPosts,
    totalCheckIns,
    pendingReports,
    newUsersToday,
    newPlacesToday,
  ] = await Promise.all([
    User.countDocuments({ isActive: true }),
    Place.countDocuments({ isActive: true }),
    Review.countDocuments(),
    Post.countDocuments({ isActive: true }),
    CheckIn.countDocuments(),
    Report.countDocuments({ status: 'pending' }),
    User.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    }),
    Place.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    }),
  ]);

  // User growth last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const userGrowth = await User.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Top provinces by check-ins
  const topProvinces = await CheckIn.aggregate([
    {
      $lookup: { from: 'places', localField: 'placeId', foreignField: '_id', as: 'place' },
    },
    { $unwind: '$place' },
    { $group: { _id: '$place.province', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  sendSuccess(res, {
    stats: {
      totalUsers,
      totalPlaces,
      totalReviews,
      totalPosts,
      totalCheckIns,
      pendingReports,
      newUsersToday,
      newPlacesToday,
    },
    userGrowth,
    topProvinces,
  });
});

export const getAdminUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = '1', limit = '20', search, role } = req.query as Record<string, string>;
  const p = parseInt(page), l = parseInt(limit);

  const filter: Record<string, unknown> = {};
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { displayName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter).sort('-createdAt').skip((p - 1) * l).limit(l).lean(),
    User.countDocuments(filter),
  ]);

  sendPaginated(res, users, total, p, l);
});

export const updateUserRole = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { role } = req.body as { role: 'user' | 'admin' | 'business' };
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  sendSuccess(res, { user }, 'User role updated');
});

export const toggleUserStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) return;
  user.isActive = !user.isActive;
  await user.save();
  sendSuccess(res, { isActive: user.isActive }, `User ${user.isActive ? 'activated' : 'suspended'}`);
});

export const getAdminPlaces = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = '1', limit = '20', province, category, isVerified } = req.query as Record<string, string>;
  const p = parseInt(page), l = parseInt(limit);

  const filter: Record<string, unknown> = {};
  if (province) filter.province = province;
  if (category) filter.category = category;
  if (isVerified !== undefined) filter.isVerified = isVerified === 'true';

  const [places, total] = await Promise.all([
    Place.find(filter)
      .populate('createdBy', 'displayName email')
      .sort('-createdAt')
      .skip((p - 1) * l)
      .limit(l)
      .lean(),
    Place.countDocuments(filter),
  ]);

  sendPaginated(res, places, total, p, l);
});

export const verifyPlace = asyncHandler(async (req: AuthRequest, res: Response) => {
  const place = await Place.findByIdAndUpdate(
    req.params.id,
    { isVerified: true, updatedBy: req.user!._id },
    { new: true },
  );
  sendSuccess(res, { place }, 'Place verified');
});

export const getReports = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = '1', limit = '20', status } = req.query as Record<string, string>;
  const p = parseInt(page), l = parseInt(limit);

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;

  const [reports, total] = await Promise.all([
    Report.find(filter)
      .populate('reporterId', 'displayName email')
      .sort('-createdAt')
      .skip((p - 1) * l)
      .limit(l)
      .lean(),
    Report.countDocuments(filter),
  ]);

  sendPaginated(res, reports, total, p, l);
});

export const resolveReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { status, resolution } = req.body as { status: string; resolution?: string };
  const report = await Report.findByIdAndUpdate(
    req.params.id,
    { status, resolution, reviewedBy: req.user!._id },
    { new: true },
  );
  sendSuccess(res, { report }, 'Report updated');
});
