import mongoose from 'mongoose';
import { config } from './config';
import { Place } from './models/Place';
import { User } from './models/User';
import { Badge } from './models/Gamification';
import { logger } from './utils/logger';

const SAMPLE_BADGES = [
  {
    name: 'Người Tiên Phong',
    nameEn: 'Pioneer Explorer',
    description: 'Thực hiện 5 lần check-in đầu tiên',
    icon: '🧭',
    color: '#FF6B35',
    criteria: { type: 'checkins', threshold: 5 },
    xpReward: 100,
    pointsReward: 50,
    rarity: 'common',
  },
  {
    name: 'Chinh Phục 10 Tỉnh',
    nameEn: '10 Provinces Conqueror',
    description: 'Khám phá và check-in tại hơn 10 tỉnh thành Việt Nam',
    icon: '🗺️',
    color: '#00C9B1',
    criteria: { type: 'provinces', threshold: 10 },
    xpReward: 500,
    pointsReward: 250,
    rarity: 'rare',
  },
  {
    name: 'Thợ Săn Ngọc Ẩn',
    nameEn: 'Hidden Gem Hunter',
    description: 'Check-in tại 5 địa điểm bí ẩn (Hidden Gems)',
    icon: '💎',
    color: '#9F7AEA',
    criteria: { type: 'custom', threshold: 5 },
    xpReward: 1000,
    pointsReward: 500,
    rarity: 'epic',
  },
];

const SAMPLE_PLACES = [
  {
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
    travelTips: ['Nên đi tour du thuyền ngủ đêm để ngắm hoàng hôn và bình minh'],
    communityRating: 4.9,
    reviewCount: 1520,
    checkinCount: 15420,
    saveCount: 3200,
    isHiddenGem: false,
    isTrending: true,
    isVerified: true,
    isActive: true,
    tags: ['di-san', 'bien-dao', 'kayak', 'vinh-ha-long'],
  },
  {
    name: 'Phố cổ Hội An',
    nameEn: 'Hoi An Ancient Town',
    slug: 'pho-co-hoi-an',
    description: 'Đô thị cổ được bảo tồn nguyên vẹn với những ngôi nhà mái ngói rêu phong, đèn lồng rực rỡ bên dòng sông Hoài thơ mộng.',
    category: 'historical',
    province: 'Quảng Nam',
    district: 'TP. Hội An',
    address: 'Minh An, TP. Hội An, Tỉnh Quảng Nam',
    location: { type: 'Point', coordinates: [108.3272, 15.8801] },
    coverImage: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=1000&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=1000&auto=format&fit=crop'],
    facilities: ['Phố đi bộ', 'Thuê xe đạp', 'Cơm gà', 'Cao lầu', 'Chèo thuyền hoa đăng'],
    travelTips: ['Tối ngày rằm hàng tháng toàn phố tắt đèn và thắp đèn lồng'],
    communityRating: 4.8,
    reviewCount: 1230,
    checkinCount: 12300,
    saveCount: 4500,
    isHiddenGem: false,
    isTrending: true,
    isVerified: true,
    isActive: true,
    tags: ['pho-co', 'den-long', 'am-thuc', 'di-san'],
  },
  {
    name: 'Ruộng bậc thang Mù Cang Chải',
    nameEn: 'Mu Cang Chai Terraced Fields',
    slug: 'ruong-bac-thang-mu-cang-chai',
    description: 'Tuyệt tác bậc thang vàng óng mùa lúa chín uốn lượn quanh sườn núi Hoàng Liên Sơn.',
    category: 'mountain',
    province: 'Yên Bái',
    district: 'Mù Cang Chải',
    address: 'Huyện Mù Cang Chải, Tỉnh Yên Bái',
    location: { type: 'Point', coordinates: [104.0868, 21.8492] },
    coverImage: 'https://images.unsplash.com/photo-1508672019048-805b876b67e2?q=80&w=1000&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1508672019048-805b876b67e2?q=80&w=1000&auto=format&fit=crop'],
    facilities: ['Homestay bản địa', 'Ngắm dù lượn', 'Check-in đồi Móng Ngựa'],
    travelTips: ['Thời điểm đẹp nhất là tháng 9 - tháng 10 mùa lúa chín'],
    communityRating: 4.8,
    reviewCount: 780,
    checkinCount: 7800,
    saveCount: 2900,
    isHiddenGem: true,
    isTrending: false,
    isVerified: true,
    isActive: true,
    tags: ['tay-bac', 'mua-vang', 'phuot', 'ruong-bac-thang'],
  },
  {
    name: 'Hồ Tuyền Lâm & Rừng Thông Đà Lạt',
    nameEn: 'Tuyen Lam Lake Da Lat',
    slug: 'ho-tuyen-lam-da-lat',
    description: 'Hồ nước ngọt tĩnh lặng bao quanh bởi rừng thông bạt ngàn, khí hậu se lạnh mát mẻ quanh năm.',
    category: 'camping',
    province: 'Lâm Đồng',
    district: 'TP. Đà Lạt',
    address: 'Phường 4, TP. Đà Lạt, Tỉnh Lâm Đồng',
    location: { type: 'Point', coordinates: [108.4336, 11.8906] },
    coverImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1000&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1000&auto=format&fit=crop'],
    facilities: ['Cắm trại ven hồ', 'Chèo SUP', 'Quán cà phê view rừng thông'],
    travelTips: ['Sáng sớm ngắm sương mù giăng trên mặt hồ cực kỳ lãng mạn'],
    communityRating: 4.7,
    reviewCount: 950,
    checkinCount: 11400,
    saveCount: 3800,
    isHiddenGem: false,
    isTrending: true,
    isVerified: true,
    isActive: true,
    tags: ['da-lat', 'camping', 'cheo-sup', 'chill'],
  },
  {
    name: 'Đảo Ngọc Phú Quốc',
    nameEn: 'Phu Quoc Pearl Island',
    slug: 'dao-ngoc-phu-quoc',
    description: 'Thiên đường biển đảo phía Nam với bãi Sao cát trắng mịn, hoàng hôn rực rỡ và hải sản tươi ngon.',
    category: 'beach',
    province: 'Kiên Giang',
    district: 'TP. Phú Quốc',
    address: 'TP. Phú Quốc, Tỉnh Kiên Giang',
    location: { type: 'Point', coordinates: [103.9632, 10.2899] },
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop'],
    facilities: ['Resort 5 sao', 'Lặn ngắm san hô', 'Cáp treo Hòn Thơm', 'Chợ đêm'],
    travelTips: ['Mùa khô từ tháng 11 đến tháng 4 năm sau là lý tưởng nhất để tắm biển'],
    communityRating: 4.8,
    reviewCount: 1120,
    checkinCount: 11200,
    saveCount: 4200,
    isHiddenGem: false,
    isTrending: true,
    isVerified: true,
    isActive: true,
    tags: ['bien-phu-quoc', 'hoang-hon', 'san-ho', 'hai-san'],
  },
];

export async function seedDatabase(): Promise<void> {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(config.mongodb.uri);
    }

    logger.info('🌱 Starting LocalGo Vietnam database seeding...');

    // 1. Badges
    for (const b of SAMPLE_BADGES) {
      await Badge.findOneAndUpdate({ name: b.name }, b, { upsert: true, new: true });
    }
    logger.info(`✅ Seeded ${SAMPLE_BADGES.length} Badges`);

    // 2. Admin & Demo User
    let adminUser = await User.findOne({ email: 'admin@localgo.vn' });
    if (!adminUser) {
      adminUser = await User.create({
        firebaseUid: 'dev_admin_uid',
        email: 'admin@localgo.vn',
        displayName: 'LocalGo Administrator',
        role: 'admin',
        points: 5000,
        xp: 10000,
        level: 5,
        visitedProvincesCount: 45,
      });
      logger.info('✅ Created Admin user: admin@localgo.vn');
    }

    // 3. Places
    for (const p of SAMPLE_PLACES) {
      await Place.findOneAndUpdate(
        { slug: p.slug },
        { ...p, createdBy: adminUser._id },
        { upsert: true, new: true },
      );
    }
    logger.info(`✅ Seeded ${SAMPLE_PLACES.length} featured Vietnam destinations`);

    logger.info('🎉 Database seeding complete!');
  } catch (error) {
    logger.error('Database seeding error:', error);
  }
}

if (require.main === module) {
  seedDatabase().then(() => {
    mongoose.disconnect();
    process.exit(0);
  });
}
