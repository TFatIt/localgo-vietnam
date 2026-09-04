import api from './api';

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  badge?: string;
  active: boolean;
}

export interface SiteSettings {
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
  banners: Banner[];
  featuredDestinations: string[];
  footerText: string;
}

export const settingsService = {
  getSettings: async (): Promise<SiteSettings> => {
    try {
      const response = await api.get('/settings');
      if (response.data?.success && response.data?.data?.settings) {
        return response.data.data.settings;
      }
      return DEFAULT_FALLBACK_SETTINGS;
    } catch {
      return DEFAULT_FALLBACK_SETTINGS;
    }
  },
};

export const DEFAULT_FALLBACK_SETTINGS: SiteSettings = {
  siteName: 'LocalGo Vietnam - Du Lịch Việt',
  hotline: '1900 1177',
  supportEmail: 'info@dulichviet.com.vn',
  companyAddress: '217 Pasteur, Phường Võ Thị Sáu, Quận 3, TP. Hồ Chí Minh',
  workingHours: '08:00 - 18:00 (Thứ 2 - Thứ 7)',
  headerAnnouncement: '🔥 Chào Hè 2026: Ưu đãi giảm đến 40% Tour Biển Đảo Phú Quốc & Vịnh Hạ Long!',
  primaryColor: '#E8302A',
  secondaryColor: '#FFB800',
  heroTitle: 'Khám Phá Việt Nam Tươi Đẹp & Kỳ Vĩ',
  heroSubtitle: 'Hơn 500+ điểm đến, tour trọn gói và lịch trình thông minh cùng Trợ lý AI Gemini 3.8',
  banners: [
    {
      id: 'b1',
      title: 'Tour Vịnh Hạ Long - Kỳ Quan Thế Giới',
      subtitle: 'Du thuyền 5 sao 2N1Đ - Chèo kayak ngắm hoàng hôn vịnh biển',
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
  featuredDestinations: ['Quảng Ninh', 'Đà Nẵng', 'Lào Cai', 'Kiên Giang', 'Lâm Đồng', 'Ninh Bình'],
  footerText: '© 2026 LocalGo Vietnam. Bản quyền thuộc về Hệ Thống Du Lịch Việt.',
};
