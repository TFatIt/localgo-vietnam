import fs from 'fs';
import path from 'path';
import { SiteSetting, ISiteSetting } from '../models/SiteSetting';
import { isDbConnected } from '../config/database';
import { logger } from '../utils/logger';

const DATA_FILE = path.resolve(process.cwd(), 'data/settings.json');

const DEFAULT_SETTINGS = {
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
  socialLinks: {
    facebook: 'https://facebook.com',
    youtube: 'https://youtube.com',
    tiktok: 'https://tiktok.com',
    zalo: 'https://zalo.me',
  },
};

export class SettingsService {
  private inMemorySettings: any = null;

  constructor() {
    this.loadFromFile();
  }

  private loadFromFile(): void {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        this.inMemorySettings = JSON.parse(raw);
      } else {
        this.inMemorySettings = { ...DEFAULT_SETTINGS };
        this.saveToFile(this.inMemorySettings);
      }
    } catch (e) {
      this.inMemorySettings = { ...DEFAULT_SETTINGS };
    }
  }

  private saveToFile(data: any): void {
    try {
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      logger.error('Failed to write settings file:', e);
    }
  }

  public async getSettings(): Promise<any> {
    if (isDbConnected) {
      try {
        let s = await SiteSetting.findOne();
        if (!s) s = await SiteSetting.create(DEFAULT_SETTINGS);
        return s;
      } catch (err) {
        logger.warn('Failed to query SiteSetting from DB, falling back to local storage.');
      }
    }
    if (!this.inMemorySettings) this.loadFromFile();
    return this.inMemorySettings;
  }

  public async updateSettings(data: any): Promise<any> {
    if (isDbConnected) {
      try {
        let s = await SiteSetting.findOne();
        if (!s) {
          s = new SiteSetting(data);
        } else {
          Object.assign(s, data);
        }
        await s.save();
        this.inMemorySettings = s.toObject();
        this.saveToFile(this.inMemorySettings);
        return s;
      } catch (err) {
        logger.warn('Failed to update SiteSetting in DB, falling back to local file.');
      }
    }

    this.inMemorySettings = { ...DEFAULT_SETTINGS, ...this.inMemorySettings, ...data, updatedAt: new Date().toISOString() };
    this.saveToFile(this.inMemorySettings);
    return this.inMemorySettings;
  }
}

export const settingsService = new SettingsService();
