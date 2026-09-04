import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { User } from '../models/User';
import { Place } from '../models/Place';
import { Review } from '../models/Review';
import { Post } from '../models/Post';
import { CheckIn } from '../models/CheckIn';
import { Report } from '../models/Report';
import { settingsService } from '../services/settings.service';
import { placeService } from '../services/place.service';
import { isDbConnected } from '../config/database';
import { asyncHandler, sendSuccess, sendPaginated } from '../utils/helpers';

const toSlug = (str: string): string => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
};

// In-memory mock store for offline development
const MOCK_ADMIN_USERS = [
  {
    _id: '65e000000000000000000001',
    displayName: 'Quản Trị Viên LocalGo',
    email: 'admin@localgo.vn',
    role: 'admin',
    level: 5,
    points: 5000,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    _id: '65e000000000000000000002',
    displayName: 'Nguyễn Văn Tuấn (HDV Du Lịch)',
    email: 'tuan.guide@dulichviet.com.vn',
    role: 'business',
    level: 4,
    points: 3200,
    isActive: true,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    _id: '65e000000000000000000003',
    displayName: 'Trần Thị Mai',
    email: 'mai.tran@gmail.com',
    role: 'user',
    level: 3,
    points: 1450,
    isActive: true,
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
  },
  {
    _id: '65e000000000000000000004',
    displayName: 'Lê Hoàng Long (Traveler)',
    email: 'long.travel@yahoo.com',
    role: 'user',
    level: 2,
    points: 890,
    isActive: true,
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
];

const MOCK_REVIEWS = [
  {
    _id: 'rev_1',
    userId: { displayName: 'Trần Thị Mai', email: 'mai.tran@gmail.com' },
    placeId: { name: 'Vịnh Hạ Long', province: 'Quảng Ninh' },
    rating: 5,
    comment: 'Chuyến đi tuyệt vời cùng gia đình! Cảnh sắc Vịnh Hạ Long ngắm từ du thuyền lúc hoàng hôn đẹp tựa tranh vẽ.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    _id: 'rev_2',
    userId: { displayName: 'Lê Hoàng Long', email: 'long.travel@yahoo.com' },
    placeId: { name: 'Phố Cổ Hội An', province: 'Quảng Nam' },
    rating: 5,
    comment: 'Phố cổ về đêm lung linh đèn lồng, ẩm thực Cao Lầu và chè mè đen rất đặc sắc!',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    _id: 'rev_3',
    userId: { displayName: 'Nguyễn Văn Tuấn', email: 'tuan.guide@dulichviet.com.vn' },
    placeId: { name: 'Đỉnh Fansipan', province: 'Lào Cai' },
    rating: 5,
    comment: 'Săn mây Fansipan đỉnh nóc Đông Dương cực kỳ ấn tượng, hệ thống cáp treo rất hiện đại.',
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
];

export const getDashboardStats = asyncHandler(async (_req: AuthRequest, res: Response) => {
  if (!isDbConnected) {
    return sendSuccess(res, {
      stats: {
        totalUsers: 148,
        totalPlaces: 36,
        totalReviews: 215,
        totalPosts: 89,
        totalCheckIns: 1420,
        pendingReports: 0,
        newUsersToday: 6,
        newPlacesToday: 2,
      },
      userGrowth: [
        { _id: '2026-08-29', count: 8 },
        { _id: '2026-08-30', count: 12 },
        { _id: '2026-08-31', count: 15 },
        { _id: '2026-09-01', count: 18 },
        { _id: '2026-09-02', count: 22 },
        { _id: '2026-09-03', count: 27 },
        { _id: '2026-09-04', count: 35 },
      ],
      topProvinces: [
        { _id: 'Quảng Ninh (Hạ Long)', count: 432 },
        { _id: 'Đà Nẵng', count: 388 },
        { _id: 'Lào Cai (Sa Pa)', count: 295 },
        { _id: 'Kiên Giang (Phú Quốc)', count: 240 },
        { _id: 'Quảng Nam (Hội An)', count: 198 },
        { _id: 'Lâm Đồng (Đà Lạt)', count: 180 },
      ],
    });
  }

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

  if (!isDbConnected) {
    let list = [...MOCK_ADMIN_USERS];
    if (role) list = list.filter((u) => u.role === role);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) => u.displayName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
      );
    }
    return sendPaginated(res, list, list.length, p, l);
  }

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

  if (!isDbConnected) {
    const user = MOCK_ADMIN_USERS.find((u) => u._id === req.params.id);
    if (user) user.role = role;
    return sendSuccess(res, { user }, 'User role updated');
  }

  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  sendSuccess(res, { user }, 'User role updated');
});

export const toggleUserStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!isDbConnected) {
    const user = MOCK_ADMIN_USERS.find((u) => u._id === req.params.id);
    if (user) user.isActive = !user.isActive;
    return sendSuccess(
      res,
      { isActive: user ? user.isActive : true },
      `User status updated`,
    );
  }

  const user = await User.findById(req.params.id);
  if (!user) return;
  user.isActive = !user.isActive;
  await user.save();
  sendSuccess(res, { isActive: user.isActive }, `User ${user.isActive ? 'activated' : 'suspended'}`);
});

export const getAdminPlaces = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = '1', limit = '20', province, category, isVerified, search } = req.query as Record<
    string,
    string
  >;
  const p = parseInt(page), l = parseInt(limit);

  if (!isDbConnected) {
    const result = await placeService.getPlaces({
      page: p,
      limit: l,
      province,
      category,
      search,
    });
    return sendPaginated(res, result.places, result.total, p, l);
  }

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
  if (!isDbConnected) {
    return sendSuccess(res, { place: { _id: req.params.id, isVerified: true } }, 'Place verified');
  }

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

  if (!isDbConnected) {
    return sendPaginated(res, [], 0, p, l);
  }

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
  if (!isDbConnected) {
    return sendSuccess(res, { report: { _id: req.params.id, status: req.body.status } }, 'Report updated');
  }

  const { status, resolution } = req.body as { status: string; resolution?: string };
  const report = await Report.findByIdAndUpdate(
    req.params.id,
    { status, resolution, reviewedBy: req.user!._id },
    { new: true },
  );
  sendSuccess(res, { report }, 'Report updated');
});

// --- CMS & Giao Diện (DulichViet Style) ---
export const getSiteSettings = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const settings = await settingsService.getSettings();
  sendSuccess(res, { settings }, 'Site settings retrieved');
});

export const updateSiteSettings = asyncHandler(async (req: AuthRequest, res: Response) => {
  const settings = await settingsService.updateSettings(req.body);
  sendSuccess(res, { settings }, 'Cập nhật giao diện thành công');
});

// --- Places Management for Admin ---
export const adminCreatePlace = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = req.body;
  const slug = toSlug(data.name || 'diem-den') + '-' + Date.now().toString().slice(-4);

  if (!isDbConnected) {
    const mockPlace = {
      _id: 'mock_p_' + Date.now(),
      ...data,
      slug,
      communityRating: 5.0,
      reviewCount: 1,
      checkinCount: 1,
      isVerified: true,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    return sendSuccess(res, { place: mockPlace }, 'Tạo điểm đến mới thành công', 201);
  }

  const place = await Place.create({
    ...data,
    slug,
    createdBy: req.user?._id,
    isVerified: data.isVerified !== undefined ? data.isVerified : true,
    isActive: true,
  });

  sendSuccess(res, { place }, 'Tạo điểm đến mới thành công', 201);
});

export const adminUpdatePlace = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!isDbConnected) {
    return sendSuccess(res, { place: { _id: req.params.id, ...req.body } }, 'Cập nhật địa điểm thành công');
  }

  const place = await Place.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!place) {
    res.status(404).json({ success: false, message: 'Không tìm thấy địa điểm' });
    return;
  }
  sendSuccess(res, { place }, 'Cập nhật địa điểm thành công');
});

export const adminDeletePlace = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!isDbConnected) {
    return sendSuccess(res, null, 'Đã xóa địa điểm thành công');
  }

  const place = await Place.findByIdAndDelete(req.params.id);
  if (!place) {
    res.status(404).json({ success: false, message: 'Không tìm thấy địa điểm' });
    return;
  }
  sendSuccess(res, null, 'Đã xóa địa điểm thành công');
});

// --- Reviews Management for Admin ---
export const getAdminReviews = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = '1', limit = '20' } = req.query as Record<string, string>;
  const p = parseInt(page), l = parseInt(limit);

  if (!isDbConnected) {
    return sendPaginated(res, MOCK_REVIEWS, MOCK_REVIEWS.length, p, l);
  }

  const [reviews, total] = await Promise.all([
    Review.find()
      .populate('userId', 'displayName email avatar')
      .populate('placeId', 'name province coverImage')
      .sort('-createdAt')
      .skip((p - 1) * l)
      .limit(l)
      .lean(),
    Review.countDocuments(),
  ]);

  sendPaginated(res, reviews, total, p, l);
});

export const deleteAdminReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!isDbConnected) {
    return sendSuccess(res, null, 'Đã xóa đánh giá thành công');
  }

  await Review.findByIdAndDelete(req.params.id);
  sendSuccess(res, null, 'Đã xóa đánh giá thành công');
});
