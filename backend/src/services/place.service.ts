import { Place } from '../models/Place';
import { Review } from '../models/Review';
import { Bookmark } from '../models/Engagement';
import { NotFoundError } from '../utils/errors';
import { isDbConnected } from '../config/database';

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

const OFFLINE_PLACES = [
  {
    _id: '65e000000000000000000001',
    name: 'Vịnh Hạ Long',
    nameEn: 'Ha Long Bay',
    slug: 'vinh-ha-long',
    description: 'Kỳ quan thiên nhiên thế giới với hàng ngàn hòn đảo đá vôi kỳ vĩ nổi bật trên làn nước xanh ngọc bích.',
    category: 'national_park',
    province: 'Quảng Ninh',
    district: 'TP. Hạ Long',
    address: 'Vịnh Hạ Long, TP. Hạ Long, Tỉnh Quảng Ninh',
    location: { type: 'Point', coordinates: [107.0844, 20.9101] },
    coverImage: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1000&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop',
    ],
    facilities: ['Tàu du lịch', 'Chèo kayak', 'Nhà hàng trên biển'],
    travelTips: ['Nên đặt tour du thuyền ngủ đêm để ngắm hoàng hôn và bình minh.', 'Thời gian lý tưởng từ tháng 3 - tháng 5.'],
    bestVisitingSeason: ['spring', 'autumn'],
    communityRating: 4.9,
    reviewCount: 1250,
    checkinCount: 3420,
    isHiddenGem: false,
    isTrending: true,
    isVerified: true,
    isActive: true,
  },
  {
    _id: '65e000000000000000000002',
    name: 'Phố Cổ Hội An',
    nameEn: 'Hoi An Ancient Town',
    slug: 'pho-co-hoi-an',
    description: 'Di sản văn hóa thế giới UNESCO với những ngôi nhà cổ mái ngói rêu phong, đèn lồng rực rỡ và dòng sông Hoài thơ mộng.',
    category: 'culture_history',
    province: 'Quảng Nam',
    district: 'TP. Hội An',
    address: 'Minh An, TP. Hội An, Quảng Nam',
    location: { type: 'Point', coordinates: [108.3262, 15.8801] },
    coverImage: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=1000&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000&auto=format&fit=crop',
    ],
    facilities: ['Phố đi bộ', 'Thuyền hoa đăng', 'Quán cà phê view đẹp'],
    travelTips: ['Đi vào đêm rằm âm lịch để ngắm trọn vẹn phố đèn lồng lung linh.', 'Nhớ thưởng thức món cao lầu và nước mót.'],
    bestVisitingSeason: ['spring', 'summer'],
    communityRating: 4.8,
    reviewCount: 980,
    checkinCount: 2890,
    isHiddenGem: false,
    isTrending: true,
    isVerified: true,
    isActive: true,
  },
  {
    _id: '65e000000000000000000003',
    name: 'Thung Lũng Dasar',
    nameEn: 'Dasar Valley',
    slug: 'thung-lung-dasar',
    description: 'Thiên đường săn mây bồng bềnh nguyên sơ giữa rừng thông đại ngàn Lạc Dương, cách trung tâm Đà Lạt 20km.',
    category: 'mountain_hiking',
    province: 'Lâm Đồng',
    district: 'Huyện Lạc Dương',
    address: 'Xã Đạ Sar, Huyện Lạc Dương, Tỉnh Lâm Đồng',
    location: { type: 'Point', coordinates: [108.5333, 11.9833] },
    coverImage: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1000&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1000&auto=format&fit=crop',
    ],
    facilities: ['Điểm cắm trại', 'Đốt lửa trại', 'Ngắm bình minh'],
    travelTips: ['Cần dậy từ 4h30 sáng để đến điểm săn mây kịp lúc bình minh.', 'Nên mang áo ấm giữ nhiệt.'],
    bestVisitingSeason: ['autumn', 'winter'],
    communityRating: 4.9,
    reviewCount: 310,
    checkinCount: 780,
    isHiddenGem: true,
    isTrending: true,
    isVerified: true,
    isActive: true,
  },
  {
    _id: '65e000000000000000000004',
    name: 'Bãi Sao Phú Quốc',
    nameEn: 'Sao Beach Phu Quoc',
    slug: 'bai-sao-phu-quoc',
    description: 'Bãi biển đẹp nhất đảo ngọc Phú Quốc với cát trắng mịn như kem và hàng dừa nghiêng bóng bên làn nước biển phẳng lặng.',
    category: 'beach_island',
    province: 'Kiên Giang',
    district: 'TP. Phú Quốc',
    address: 'Ấp Bãi Sao, Phường An Thới, TP. Phú Quốc, Kiên Giang',
    location: { type: 'Point', coordinates: [104.0322, 10.0544] },
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop',
    ],
    facilities: ['Ghế nằm bãi biển', 'Chèo SUP', 'Nhà hàng hải sản tươi sống'],
    travelTips: ['Mùa biển êm và nước trong nhất từ tháng 6 đến tháng 10.', 'Có nhiều góc chụp hình xích đu ven biển.'],
    bestVisitingSeason: ['summer', 'autumn'],
    communityRating: 4.7,
    reviewCount: 840,
    checkinCount: 1950,
    isHiddenGem: false,
    isTrending: true,
    isVerified: true,
    isActive: true,
  },
  {
    _id: '65e000000000000000000005',
    name: 'Đỉnh Fansipan - Nóc Nhà Đông Dương',
    nameEn: 'Fansipan Peak',
    slug: 'dinh-fansipan',
    description: 'Ngọn núi cao nhất bán đảo Đông Dương với độ cao 3.143m, biển mây cuồn cuộn và quần thể tâm linh kỳ vĩ trên đỉnh.',
    category: 'mountain_hiking',
    province: 'Lào Cai',
    district: 'TX. Sa Pa',
    address: 'Dãy Hoàng Liên Sơn, TX. Sa Pa, Tỉnh Lào Cai',
    location: { type: 'Point', coordinates: [103.7753, 22.3033] },
    coverImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000&auto=format&fit=crop',
    ],
    facilities: ['Cáp treo 3 dây kỷ lục', 'Tàu hỏa leo núi', 'Nhà hàng đỉnh mây'],
    travelTips: ['Kiểm tra dự báo thời tiết trước khi lên đỉnh để săn được biển mây.', 'Nhiệt độ trên đỉnh có thể xuống dưới 5°C.'],
    bestVisitingSeason: ['autumn', 'winter'],
    communityRating: 4.9,
    reviewCount: 1120,
    checkinCount: 3100,
    isHiddenGem: false,
    isTrending: true,
    isVerified: true,
    isActive: true,
  },
];

export class PlaceService {
  async getPlaces(query: GetPlacesQuery) {
    if (!isDbConnected) {
      let filtered = [...OFFLINE_PLACES];
      if (query.province) filtered = filtered.filter((p) => p.province.toLowerCase().includes(query.province!.toLowerCase()));
      if (query.category) filtered = filtered.filter((p) => p.category === query.category);
      if (query.isHiddenGem !== undefined) filtered = filtered.filter((p) => p.isHiddenGem === query.isHiddenGem);
      if (query.isTrending !== undefined) filtered = filtered.filter((p) => p.isTrending === query.isTrending);
      if (query.search) {
        const s = query.search.toLowerCase();
        filtered = filtered.filter((p) => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s));
      }
      const page = query.page || 1;
      const limit = query.limit || 20;
      const total = filtered.length;
      return { places: filtered.slice((page - 1) * limit, page * limit), total, page, limit };
    }

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
    if (!isDbConnected) {
      const match = OFFLINE_PLACES.find((p) => p._id === id || p.slug === id);
      if (!match) throw new NotFoundError('Place not found');
      return { ...match, isBookmarked: false, recentReviews: [] };
    }

    const place = await Place.findById(id)
      .populate('createdBy', 'displayName avatar')
      .lean();

    if (!place || !place.isActive) throw new NotFoundError('Place not found');

    let isBookmarked = false;
    if (userId) {
      const bookmark = await Bookmark.findOne({ userId, placeId: id });
      isBookmarked = !!bookmark;
    }

    const reviews = await Review.find({ placeId: id, isHidden: false })
      .populate('userId', 'displayName avatar')
      .sort('-createdAt')
      .limit(5)
      .lean();

    return { ...place, isBookmarked, recentReviews: reviews };
  }

  async getNearbyPlaces(query: NearbyQuery) {
    if (!isDbConnected) {
      return OFFLINE_PLACES.slice(0, query.limit || 10);
    }

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
    if (!isDbConnected) {
      return OFFLINE_PLACES.filter((p) => p.isTrending).slice(0, limit);
    }

    return Place.find({ isActive: true, isTrending: true })
      .sort('-checkinCount -communityRating')
      .limit(limit)
      .lean();
  }

  async getHiddenGems(province?: string, limit = 10) {
    if (!isDbConnected) {
      let gems = OFFLINE_PLACES.filter((p) => p.isHiddenGem);
      if (province) gems = gems.filter((p) => p.province.toLowerCase().includes(province.toLowerCase()));
      return gems.slice(0, limit);
    }

    const filter: Record<string, unknown> = { isActive: true, isHiddenGem: true };
    if (province) filter.province = province;
    return Place.find(filter).sort('-communityRating').limit(limit).lean();
  }

  async updateRating(placeId: string): Promise<void> {
    if (!isDbConnected) return;

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
