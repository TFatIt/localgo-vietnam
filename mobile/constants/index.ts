export const VIETNAM_PROVINCES = [
  'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu',
  'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước',
  'Bình Thuận', 'Cà Mau', 'Cần Thơ', 'Cao Bằng', 'Đà Nẵng',
  'Đắk Lắk', 'Đắk Nông', 'Điện Biên', 'Đồng Nai', 'Đồng Tháp',
  'Gia Lai', 'Hà Giang', 'Hà Nam', 'Hà Nội', 'Hà Tĩnh',
  'Hải Dương', 'Hải Phòng', 'Hậu Giang', 'Hòa Bình', 'Hưng Yên',
  'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu', 'Lâm Đồng',
  'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định', 'Nghệ An',
  'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên', 'Quảng Bình',
  'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị', 'Sóc Trăng',
  'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên', 'Thanh Hóa',
  'Thừa Thiên Huế', 'Tiền Giang', 'TP. Hồ Chí Minh', 'Trà Vinh',
  'Tuyên Quang', 'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái',
] as const;

export const TRAVEL_INTERESTS = [
  'beach', 'mountain', 'camping', 'food', 'history',
  'culture', 'adventure', 'photography', 'backpacking', 'luxury',
  'eco_tourism', 'family', 'solo', 'night_life', 'wellness',
];

export const TRAVEL_STYLES = [
  { value: 'budget', label: 'Tiết kiệm', labelEn: 'Budget' },
  { value: 'moderate', label: 'Vừa phải', labelEn: 'Moderate' },
  { value: 'luxury', label: 'Sang trọng', labelEn: 'Luxury' },
  { value: 'adventure', label: 'Phiêu lưu', labelEn: 'Adventure' },
  { value: 'cultural', label: 'Văn hóa', labelEn: 'Cultural' },
];

export const COMPANION_TYPES = [
  { value: 'solo', label: 'Một mình', labelEn: 'Solo', emoji: '🧍' },
  { value: 'couple', label: 'Đôi', labelEn: 'Couple', emoji: '👫' },
  { value: 'family', label: 'Gia đình', labelEn: 'Family', emoji: '👨‍👩‍👧' },
  { value: 'friends', label: 'Bạn bè', labelEn: 'Friends', emoji: '👯' },
  { value: 'group', label: 'Nhóm', labelEn: 'Group', emoji: '👥' },
];

export const TRANSPORTATION = [
  { value: 'motorbike', label: 'Xe máy', emoji: '🛵' },
  { value: 'car', label: 'Ô tô', emoji: '🚗' },
  { value: 'bus', label: 'Xe buýt', emoji: '🚌' },
  { value: 'train', label: 'Tàu hỏa', emoji: '🚂' },
  { value: 'plane', label: 'Máy bay', emoji: '✈️' },
  { value: 'bicycle', label: 'Xe đạp', emoji: '🚴' },
];

export const XP_LEVELS = [
  { level: 1, label: 'Người mới', minXp: 0, maxXp: 500, color: '#718096' },
  { level: 2, label: 'Lữ hành', minXp: 500, maxXp: 1500, color: '#48BB78' },
  { level: 3, label: 'Phượt thủ', minXp: 1500, maxXp: 3500, color: '#4299E1' },
  { level: 4, label: 'Nhà thám hiểm', minXp: 3500, maxXp: 7000, color: '#9F7AEA' },
  { level: 5, label: 'Bậc thầy du lịch', minXp: 7000, maxXp: Infinity, color: '#FFD700' },
];

import { Platform } from 'react-native';
import Constants from 'expo-constants';

const resolveApiBaseUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:5000/api/v1';
  }
  
  // Auto-detect host IP dynamically from Expo connection
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:5000/api/v1`;
  }
  
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api/v1';
  }
  
  return process.env.EXPO_PUBLIC_API_URL || 'http://192.168.10.148:5000/api/v1';
};

export const API_BASE_URL = resolveApiBaseUrl();
  
export const GOOGLE_MAPS_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY || '';

