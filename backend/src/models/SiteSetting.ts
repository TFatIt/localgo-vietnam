import mongoose, { Document, Schema } from 'mongoose';

export interface IBanner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  badge?: string;
  active: boolean;
}

export interface ISiteSetting extends Document {
  siteName: string;
  hotline: string;
  supportEmail: string;
  companyAddress: string;
  workingHours: string;
  headerAnnouncement: string;
  primaryColor: string;
  secondaryColor: string;
  heroTitle: string;
  heroSubtitle: string;
  banners: IBanner[];
  featuredDestinations: string[];
  footerText: string;
  socialLinks: {
    facebook?: string;
    youtube?: string;
    tiktok?: string;
    zalo?: string;
  };
  updatedAt: Date;
}

const BannerSchema = new Schema<IBanner>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  imageUrl: { type: String, required: true },
  linkUrl: { type: String, default: '#' },
  badge: { type: String, default: 'HOT' },
  active: { type: Boolean, default: true },
});

const SiteSettingSchema = new Schema<ISiteSetting>(
  {
    siteName: { type: String, default: 'LocalGo Vietnam - Du Lịch Việt' },
    hotline: { type: String, default: '1900 1177' },
    supportEmail: { type: String, default: 'info@dulichviet.com.vn' },
    companyAddress: { type: String, default: '217 Pasteur, Phường Võ Thị Sáu, Quận 3, TP. Hồ Chí Minh' },
    workingHours: { type: String, default: '08:00 - 18:00 (Thứ 2 - Thứ 7)' },
    headerAnnouncement: {
      type: String,
      default: '🔥 Chào Hè 2026: Ưu đãi giảm đến 40% Tour Biển Đảo Phú Quốc & Vịnh Hạ Long!',
    },
    primaryColor: { type: String, default: '#E8302A' },
    secondaryColor: { type: String, default: '#FFB800' },
    heroTitle: { type: String, default: 'Khám Phá Việt Nam Tươi Đẹp & Kỳ Vĩ' },
    heroSubtitle: {
      type: String,
      default: 'Hơn 500+ điểm đến, tour khám phá trọn gói và lịch trình tự động cùng Trợ lý AI Gemini 3.8',
    },
    banners: {
      type: [BannerSchema],
      default: [
        {
          id: 'b1',
          title: 'Tour Vịnh Hạ Long - Kỳ Quan Thế Giới',
          subtitle: 'Du thuyền 5 sao 2N1Đ - Trải nghiệm chèo kayak ngắm hoàng hôn',
          imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1200&auto=format&fit=crop',
          linkUrl: '/place/vinh-ha-long',
          badge: 'GIẢM 30%',
          active: true,
        },
        {
          id: 'b2',
          title: 'Khám Phá Đà Nẵng - Hội An - Bà Nà Hills',
          subtitle: 'Check-in Cầu Vàng nổi tiếng, phố cổ đèn lồng lung linh',
          imageUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=1200&auto=format&fit=crop',
          linkUrl: '/place/da-nang',
          badge: 'BÁN CHẠY',
          active: true,
        },
        {
          id: 'b3',
          title: 'Mùa Vàng Sa Pa - Chinh Phục Đỉnh Fansipan',
          subtitle: 'Săn mây nóc nhà Đông Dương, trải nghiệm văn hóa Tây Bắc đặc sắc',
          imageUrl: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=1200&auto=format&fit=crop',
          linkUrl: '/place/sa-pa',
          badge: 'MỚI NHẤT',
          active: true,
        },
      ],
    },
    featuredDestinations: {
      type: [String],
      default: ['Quảng Ninh', 'Đà Nẵng', 'Lào Cai', 'Kiên Giang', 'Lâm Đồng', 'Ninh Bình'],
    },
    footerText: {
      type: String,
      default: '© 2026 LocalGo Vietnam. Bản quyền thuộc về Hệ Thống Du Lịch Việt.',
    },
    socialLinks: {
      facebook: { type: String, default: 'https://facebook.com' },
      youtube: { type: String, default: 'https://youtube.com' },
      tiktok: { type: String, default: 'https://tiktok.com' },
      zalo: { type: String, default: 'https://zalo.me' },
    },
  },
  { timestamps: true },
);

export const SiteSetting = mongoose.model<ISiteSetting>('SiteSetting', SiteSettingSchema);
