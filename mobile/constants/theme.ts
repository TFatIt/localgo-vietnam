// Design System — LocalGo Vietnam
// Premium startup aesthetic: dark-first, glassmorphism, vibrant accents

export const Colors = {
  // Brand palette
  primary: '#FF6B35',       // Vibrant Vietnamese orange
  primaryLight: '#FF8C5A',
  primaryDark: '#E55A28',
  secondary: '#00C9B1',     // Teal accent
  secondaryLight: '#33D4C0',
  secondaryDark: '#00A891',
  accent: '#FFD700',        // Gold for premium elements
  
  // Background (dark theme)
  background: '#0A0E1A',
  backgroundSecondary: '#111827',
  backgroundTertiary: '#1A2235',
  surface: '#1E2A3A',
  surfaceElevated: '#243347',
  glass: 'rgba(255, 255, 255, 0.08)',
  glassBorder: 'rgba(255, 255, 255, 0.12)',
  
  // Background (light theme)
  backgroundLight: '#F8FAFC',
  backgroundSecondaryLight: '#FFFFFF',
  backgroundTertiaryLight: '#EFF3F8',
  surfaceLight: '#FFFFFF',
  surfaceElevatedLight: '#F0F4F8',
  glassLight: 'rgba(0, 0, 0, 0.05)',
  glassBorderLight: 'rgba(0, 0, 0, 0.1)',
  
  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#A0AEC0',
  textTertiary: '#718096',
  textMuted: '#4A5568',
  textPrimaryLight: '#0A0E1A',
  textSecondaryLight: '#4A5568',
  textTertiaryLight: '#718096',
  
  // Semantic
  success: '#48BB78',
  successLight: '#C6F6D5',
  warning: '#ED8936',
  warningLight: '#FEFCBF',
  error: '#FC4F62',
  errorLight: '#FED7D7',
  info: '#4299E1',
  infoLight: '#BEE3F8',
  
  // Category colors
  beach: '#00B4D8',
  mountain: '#4CAF50',
  camping: '#8BC34A',
  temple: '#FF9800',
  historical: '#9C27B0',
  waterfall: '#03A9F4',
  village: '#795548',
  cafe: '#FF5722',
  restaurant: '#F44336',
  nightMarket: '#673AB7',
  nationalPark: '#2E7D32',
  
  // UI
  border: 'rgba(255, 255, 255, 0.1)',
  borderLight: 'rgba(0, 0, 0, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.7)',
  shadow: 'rgba(0, 0, 0, 0.5)',
  
  // Ratings
  star: '#FFD700',
  
  // Gradient stops
  gradientPrimary: ['#FF6B35', '#FF8C5A'],
  gradientDark: ['#0A0E1A', '#1A2235'],
  gradientCard: ['rgba(30, 42, 58, 0.9)', 'rgba(10, 14, 26, 0.9)'],
  gradientHero: ['rgba(0,0,0,0)', 'rgba(10, 14, 26, 0.95)'],
} as const;

export const Typography = {
  fontFamily: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semiBold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
    extraBold: 'Inter_800ExtraBold',
  },
  fontSize: {
    xs: 11,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 40,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
} as const;

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  }),
} as const;

export const CategoryConfig: Record<string, { color: string; emoji: string; label: string; labelEn: string }> = {
  beach: { color: Colors.beach, emoji: '🏖️', label: 'Bãi biển', labelEn: 'Beach' },
  mountain: { color: Colors.mountain, emoji: '⛰️', label: 'Núi', labelEn: 'Mountain' },
  camping: { color: Colors.camping, emoji: '⛺', label: 'Cắm trại', labelEn: 'Camping' },
  temple: { color: Colors.temple, emoji: '🛕', label: 'Đền chùa', labelEn: 'Temple' },
  historical: { color: Colors.historical, emoji: '🏛️', label: 'Di tích', labelEn: 'Historical' },
  waterfall: { color: Colors.waterfall, emoji: '💦', label: 'Thác nước', labelEn: 'Waterfall' },
  village: { color: Colors.village, emoji: '🏘️', label: 'Làng', labelEn: 'Village' },
  cafe: { color: Colors.cafe, emoji: '☕', label: 'Cà phê', labelEn: 'Café' },
  restaurant: { color: Colors.restaurant, emoji: '🍜', label: 'Nhà hàng', labelEn: 'Restaurant' },
  night_market: { color: Colors.nightMarket, emoji: '🌙', label: 'Chợ đêm', labelEn: 'Night Market' },
  national_park: { color: Colors.nationalPark, emoji: '🌿', label: 'Vườn quốc gia', labelEn: 'National Park' },
};
