import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Image,
  RefreshControl,
  Animated,
  Platform,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { placesService } from '../../services/places.service';
import { settingsService, SiteSettings, DEFAULT_FALLBACK_SETTINGS } from '../../services/settings.service';
import { Colors, Typography, Spacing, BorderRadius, Shadows, CategoryConfig } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';

const { width } = Dimensions.get('window');
const isLargeScreen = width > 768;
const BANNER_WIDTH = isLargeScreen ? Math.min(width * 0.9, 1100) : width - Spacing.base * 2;
const CARD_WIDTH = isLargeScreen ? 340 : width * 0.75;
const CARD_HEIGHT = 240;

const CATEGORIES = [
  { key: 'all', label: 'Tất Cả Tour', emoji: '🌟', color: '#E8302A' },
  { key: 'beach', label: 'Biển Đảo', emoji: '🏖️', color: '#00B4D8' },
  { key: 'mountain', label: 'Núi Rừng', emoji: '⛰️', color: '#10B981' },
  { key: 'historical', label: 'Di Tích', emoji: '🏛️', color: '#8B5CF6' },
  { key: 'national_park', label: 'Sinh Thái', emoji: '🌿', color: '#059669' },
  { key: 'temple', label: 'Tâm Linh', emoji: '⛩️', color: '#F59E0B' },
  { key: 'restaurant', label: 'Ẩm Thực', emoji: '🍜', color: '#EF4444' },
  { key: 'hotel', label: 'Resort & KS', emoji: '🏨', color: '#3B82F6' },
];

const StarRating = ({ rating }: { rating: number }) => (
  <Text style={{ fontSize: 12, color: '#FFB800', fontWeight: '700' }}>
    {'★'.repeat(Math.min(5, Math.max(1, Math.round(rating))))} {rating.toFixed(1)}
  </Text>
);

export default function HomeScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const { user } = useAuthStore();
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);

  // Settings from CMS backend
  const { data: settings = DEFAULT_FALLBACK_SETTINGS, refetch: refetchSettings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: settingsService.getSettings,
    staleTime: 60 * 1000,
  });

  // Places data
  const { data: trending, refetch: refetchTrending, isLoading: loadingTrending } = useQuery({
    queryKey: ['trending'],
    queryFn: placesService.getTrending,
  });

  const { data: hiddenGems, refetch: refetchGems } = useQuery({
    queryKey: ['hidden-gems'],
    queryFn: () => placesService.getHiddenGems(),
  });

  const trendingPlaces = (trending?.data?.places || []) as Record<string, unknown>[];
  const gemPlaces = (hiddenGems?.data?.places || []) as Record<string, unknown>[];

  const displayBanners = settings.banners && settings.banners.length > 0
    ? settings.banners
    : DEFAULT_FALLBACK_SETTINGS.banners;

  // Auto scroll banners
  useEffect(() => {
    if (displayBanners.length <= 1) return;
    const timer = setInterval(() => {
      setActiveBannerIdx((prev) => (prev + 1) % displayBanners.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [displayBanners.length]);

  const onRefresh = () => {
    refetchSettings();
    refetchTrending();
    refetchGems();
  };

  const openAdminPortal = () => {
    if (Platform.OS === 'web') {
      window.open('http://localhost:5000/admin', '_blank');
    } else {
      Linking.openURL('http://localhost:5000/admin');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* TOP ANNOUNCEMENT BAR (DulichViet Style) */}
      <View style={styles.announcementBar}>
        <Text style={styles.announcementText} numberOfLines={1}>
          {settings.headerAnnouncement || '🔥 Chào Hè 2026: Ưu đãi giảm đến 40% Tour Biển Đảo & Vịnh Hạ Long!'}
        </Text>
      </View>

      {/* DULICHVIET BRAND HEADER */}
      <View style={styles.topHeader}>
        <View style={styles.brandRow}>
          <View style={styles.brandBadge}>
            <Text style={{ fontSize: 24 }}>🇻🇳</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.brandTitle}>{settings.siteName || 'LocalGo Vietnam - Du Lịch Việt'}</Text>
            <Text style={styles.brandSlogan}>Hệ Thống Tour & Cẩm Nang Du Lịch Toàn Diện</Text>
          </View>
        </View>

        <View style={styles.headerRightActions}>
          <View style={styles.hotlinePill}>
            <Text style={styles.hotlineText}>📞 CSKH: {settings.hotline || '1900 1177'}</Text>
          </View>
          <TouchableOpacity
            style={styles.adminCmsBtn}
            onPress={openAdminPortal}
            activeOpacity={0.8}
          >
            <Text style={styles.adminCmsBtnText}>⚙️ Quản Trị CMS</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loadingTrending} onRefresh={onRefresh} tintColor="#E8302A" />
        }
      >
        {/* HERO BANNER SLIDER (DulichViet Big Promo Banner) */}
        <View style={styles.bannerSliderContainer}>
          {displayBanners[activeBannerIdx] && (
            <TouchableOpacity
              style={styles.bannerCard}
              activeOpacity={0.95}
              onPress={() => router.push('/(tabs)/search')}
            >
              <Image
                source={{ uri: displayBanners[activeBannerIdx].imageUrl }}
                style={styles.bannerImage}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(13, 27, 46, 0.4)', 'rgba(13, 27, 46, 0.92)']}
                style={StyleSheet.absoluteFill}
              />

              {/* Badge */}
              <View style={styles.bannerBadgeBox}>
                <Text style={styles.bannerBadgeText}>
                  {displayBanners[activeBannerIdx].badge || 'TOUR HOT'}
                </Text>
              </View>

              {/* Banner Content */}
              <View style={styles.bannerContent}>
                <Text style={styles.bannerTitle} numberOfLines={2}>
                  {displayBanners[activeBannerIdx].title}
                </Text>
                <Text style={styles.bannerSubtitle} numberOfLines={2}>
                  {displayBanners[activeBannerIdx].subtitle}
                </Text>
                <View style={styles.bannerActionRow}>
                  <View style={styles.bannerCtaBtn}>
                    <Text style={styles.bannerCtaText}>Khám Phá Ngay →</Text>
                  </View>
                  <Text style={styles.bannerIndicatorText}>
                    {activeBannerIdx + 1} / {displayBanners.length}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}

          {/* Dots Indicator */}
          <View style={styles.dotsRow}>
            {displayBanners.map((_, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.dot, activeBannerIdx === idx && styles.dotActive]}
                onPress={() => setActiveBannerIdx(idx)}
              />
            ))}
          </View>
        </View>

        {/* SEARCH BAR (DulichViet Travel Search) */}
        <View style={styles.searchSection}>
          <TouchableOpacity
            style={styles.searchBox}
            onPress={() => router.push('/(tabs)/search')}
            activeOpacity={0.9}
          >
            <Text style={{ fontSize: 20 }}>🔍</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.searchPlaceholderTitle}>Tìm tour, điểm đến du lịch, khách sạn...</Text>
              <Text style={styles.searchPlaceholderSub}>Hạ Long, Đà Nẵng, Sa Pa, Phú Quốc, Ninh Bình...</Text>
            </View>
            <View style={styles.searchBtnRed}>
              <Text style={styles.searchBtnRedText}>Tìm Kiếm</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* TRUST BADGES STRIP (Cam Kết Du Lịch Việt) */}
        <View style={styles.trustStrip}>
          <View style={styles.trustItem}>
            <Text style={styles.trustIcon}>🛡️</Text>
            <Text style={styles.trustTitle}>Bảo Hiểm Trọn Gói</Text>
          </View>
          <View style={styles.trustDivider} />
          <View style={styles.trustItem}>
            <Text style={styles.trustIcon}>💰</Text>
            <Text style={styles.trustTitle}>Giá Luôn Tốt Nhất</Text>
          </View>
          <View style={styles.trustDivider} />
          <View style={styles.trustItem}>
            <Text style={styles.trustIcon}>📞</Text>
            <Text style={styles.trustTitle}>Hỗ Trợ 24/7 (1900 1177)</Text>
          </View>
          <View style={styles.trustDivider} />
          <View style={styles.trustItem}>
            <Text style={styles.trustIcon}>🤖</Text>
            <Text style={styles.trustTitle}>AI Gemini 3.8</Text>
          </View>
        </View>

        {/* AI PLANNER PROMO BANNER (Gemini 3.8 Flash) */}
        <TouchableOpacity
          style={styles.aiBanner}
          onPress={() => router.push('/ai-planner')}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#0D1B2E', '#1E293B', '#851815']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.aiBannerGradient}
          >
            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>⚡ GEMINI 3.8 FLASH</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <Text style={{ fontSize: 36 }}>🤖</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.aiBannerTitle}>Trợ Lý Lập Lịch Trình Du Lịch Thông Minh</Text>
                <Text style={styles.aiBannerDesc}>
                  Nhập điểm đến & ngân sách • AI Gemini 3.8 tự động lập tour từng ngày hoàn hảo!
                </Text>
              </View>
              <View style={styles.aiGoBtn}>
                <Text style={styles.aiGoBtnText}>Tạo Ngay →</Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* CATEGORIES SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionHeaderTitle}>🧭 Danh Mục Khám Phá Nổi Bật</Text>
          <FlatList
            data={CATEGORIES}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: Spacing.base, gap: 12, paddingVertical: 6 }}
            keyExtractor={(item) => item.key}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.catCard}
                onPress={() => router.push(`/(tabs)/search?category=${item.key === 'all' ? '' : item.key}`)}
                activeOpacity={0.8}
              >
                <Text style={styles.catEmoji}>{item.emoji}</Text>
                <Text style={styles.catLabel}>{item.label}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* TRENDING VIETNAM TOURS & DESTINATIONS */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <div>
              <Text style={styles.sectionHeaderTitle}>🔥 Tour & Điểm Đến Bán Chạy Nhất</Text>
              <Text style={styles.sectionSubTitle}>Các địa danh được du khách săn đón nhiều nhất trong mùa hè này</Text>
            </div>
            <TouchableOpacity onPress={() => router.push('/(tabs)/search?isTrending=true')}>
              <Text style={styles.viewAllText}>Xem tất cả tour →</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={trendingPlaces.length > 0 ? trendingPlaces : MOCK_TOURS}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: Spacing.base, gap: 18, paddingVertical: 10 }}
            keyExtractor={(item, i) => (item._id as string) || `tour_${i}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.tourCard}
                activeOpacity={0.9}
                onPress={() => router.push(`/place/${item._id}`)}
              >
                <View style={styles.tourImageWrapper}>
                  <Image
                    source={{ uri: (item.coverImage as string) || 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=600&auto=format&fit=crop' }}
                    style={styles.tourImage}
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={styles.tourLocationBadge}>
                    <Text style={styles.tourLocationText}>📍 {item.province as string}</Text>
                  </View>
                  <View style={styles.tourDiscountBadge}>
                    <Text style={styles.tourDiscountText}>TIẾT KIỆM 25%</Text>
                  </View>
                </View>

                <View style={styles.tourCardBody}>
                  <Text style={styles.tourName} numberOfLines={2}>
                    {item.name as string}
                  </Text>
                  <View style={styles.tourMetaRow}>
                    <StarRating rating={(item.communityRating as number) || 4.9} />
                    <Text style={styles.tourCheckinCount}>
                      👥 {(item.checkinCount as number) || 1200} khách đã đi
                    </Text>
                  </View>

                  <View style={styles.tourPriceRow}>
                    <View>
                      <Text style={styles.tourOldPrice}>
                        {((Number(item.ticketPrice?.adult) || 3000000) * 1.3).toLocaleString()} đ
                      </Text>
                      <Text style={styles.tourPrice}>
                        {(Number(item.ticketPrice?.adult) || 2890000).toLocaleString()} đ
                      </Text>
                    </View>
                    <View style={styles.bookNowBtn}>
                      <Text style={styles.bookNowText}>Đặt Tour</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* HIDDEN GEMS SECTION */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <div>
              <Text style={styles.sectionHeaderTitle}>💎 Trải Nghiệm Khám Phá Độc Bản</Text>
              <Text style={styles.sectionSubTitle}>Điểm đến hoang sơ, thiên nhiên kỳ vĩ dành cho người thích khám phá</Text>
            </div>
            <TouchableOpacity onPress={() => router.push('/(tabs)/search?isHiddenGem=true')}>
              <Text style={styles.viewAllText}>Khám phá thêm →</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={gemPlaces.length > 0 ? gemPlaces : MOCK_TOURS.slice(1)}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: Spacing.base, gap: 16, paddingVertical: 10 }}
            keyExtractor={(item, i) => (item._id as string) || `gem_${i}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.tourCard, { width: 260 }]}
                activeOpacity={0.9}
                onPress={() => router.push(`/place/${item._id}`)}
              >
                <Image
                  source={{ uri: (item.coverImage as string) || 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=600&auto=format&fit=crop' }}
                  style={{ width: '100%', height: 160, borderRadius: 10 }}
                />
                <View style={{ padding: 12 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#E8302A' }}>
                    {(item.province as string)?.toUpperCase()}
                  </Text>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: '#0D1B2E', marginTop: 2 }} numberOfLines={1}>
                    {item.name as string}
                  </Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                    <StarRating rating={(item.communityRating as number) || 4.8} />
                    <Text style={{ fontSize: 12, fontWeight: '800', color: '#E8302A' }}>
                      {(Number(item.ticketPrice?.adult) || 1990000).toLocaleString()} đ
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* FOOTER NOTICE (DulichViet Branding) */}
        <View style={styles.footerBanner}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#0D1B2E', marginBottom: 4 }}>
            🇻🇳 {settings.siteName || 'LocalGo Vietnam - Du Lịch Việt'}
          </Text>
          <Text style={{ fontSize: 12, color: '#64748B', lineHeight: 18, textAlign: 'center' }}>
            {settings.companyAddress || '217 Pasteur, Phường Võ Thị Sáu, Quận 3, TP. Hồ Chí Minh'}{'\n'}
            Hotline Hỗ Trợ Khách Hàng: <Text style={{ fontWeight: '800', color: '#E8302A' }}>{settings.hotline || '1900 1177'}</Text>
          </Text>
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>
    </View>
  );
}

// Fallback tours
const MOCK_TOURS = [
  {
    _id: '65e000000000000000000001',
    name: 'Tour Vịnh Hạ Long 2N1Đ - Du Thuyền 5 Sao',
    province: 'Quảng Ninh',
    coverImage: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1000&auto=format&fit=crop',
    communityRating: 4.9,
    checkinCount: 3420,
    ticketPrice: { adult: 2890000 },
  },
  {
    _id: '65e000000000000000000002',
    name: 'Khám Phá Phố Cổ Hội An & Rừng Dừa Bảy Mẫu',
    province: 'Quảng Nam',
    coverImage: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=1000&auto=format&fit=crop',
    communityRating: 4.8,
    checkinCount: 2890,
    ticketPrice: { adult: 1950000 },
  },
  {
    _id: '65e000000000000000000003',
    name: 'Tour Bà Nà Hills - Cầu Vàng Bàn Tay Khổng Lồ',
    province: 'Đà Nẵng',
    coverImage: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=1000&auto=format&fit=crop',
    communityRating: 4.9,
    checkinCount: 4120,
    ticketPrice: { adult: 1250000 },
  },
  {
    _id: '65e000000000000000000005',
    name: 'Chinh Phục Nóc Nhà Đông Dương Fansipan Sa Pa',
    province: 'Lào Cai',
    coverImage: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=1000&auto=format&fit=crop',
    communityRating: 4.9,
    checkinCount: 3100,
    ticketPrice: { adult: 2450000 },
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F9',
  },
  announcementBar: {
    backgroundColor: '#E8302A',
    paddingVertical: 7,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  announcementText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  topHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.base,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  brandBadge: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#FFF5F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FED7D7',
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0D1B2E',
    letterSpacing: -0.2,
  },
  brandSlogan: {
    fontSize: 11,
    color: '#E8302A',
    fontWeight: '700',
    marginTop: 1,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hotlinePill: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FED7D7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  hotlineText: {
    color: '#E8302A',
    fontSize: 11,
    fontWeight: '800',
  },
  adminCmsBtn: {
    backgroundColor: '#0D1B2E',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  adminCmsBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },

  /* BANNER SLIDER */
  bannerSliderContainer: {
    paddingHorizontal: Spacing.base,
    paddingTop: 16,
    paddingBottom: 8,
    alignItems: 'center',
  },
  bannerCard: {
    width: BANNER_WIDTH,
    height: isLargeScreen ? 340 : 210,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 6,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerBadgeBox: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: '#E8302A',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  bannerBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bannerContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 18,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: isLargeScreen ? 24 : 17,
    fontWeight: '800',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  bannerSubtitle: {
    color: '#E2E8F0',
    fontSize: isLargeScreen ? 14 : 12,
    marginBottom: 10,
    lineHeight: 16,
  },
  bannerActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerCtaBtn: {
    backgroundColor: '#FFB800',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  bannerCtaText: {
    color: '#0D1B2E',
    fontSize: 12,
    fontWeight: '800',
  },
  bannerIndicatorText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '700',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
  },
  dotActive: {
    width: 22,
    backgroundColor: '#E8302A',
  },

  /* SEARCH BAR */
  searchSection: {
    paddingHorizontal: Spacing.base,
    paddingVertical: 8,
  },
  searchBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  searchPlaceholderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0D1B2E',
  },
  searchPlaceholderSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  searchBtnRed: {
    backgroundColor: '#E8302A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  searchBtnRedText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },

  /* TRUST STRIP */
  trustStrip: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: Spacing.base,
    marginVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trustIcon: { fontSize: 16 },
  trustTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  trustDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#E2E8F0',
  },

  /* AI BANNER */
  aiBanner: {
    marginHorizontal: Spacing.base,
    marginVertical: 10,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  aiBannerGradient: {
    padding: 16,
    position: 'relative',
  },
  aiBadge: {
    backgroundColor: '#FFB800',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  aiBadgeText: {
    color: '#0D1B2E',
    fontSize: 10,
    fontWeight: '800',
  },
  aiBannerTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  aiBannerDesc: {
    color: '#CBD5E1',
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  aiGoBtn: {
    backgroundColor: '#E8302A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  aiGoBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },

  /* CATEGORIES */
  section: {
    marginTop: 18,
    marginBottom: 8,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0D1B2E',
    paddingHorizontal: Spacing.base,
    marginBottom: 2,
  },
  sectionSubTitle: {
    fontSize: 12,
    color: '#64748B',
    paddingHorizontal: Spacing.base,
    marginBottom: 6,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.base,
    marginBottom: 6,
  },
  viewAllText: {
    color: '#E8302A',
    fontSize: 12,
    fontWeight: '800',
  },
  catCard: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    gap: 4,
    minWidth: 90,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  catEmoji: { fontSize: 20 },
  catLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0D1B2E',
  },

  /* TOUR CARDS */
  tourCard: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  tourImageWrapper: {
    width: '100%',
    height: 155,
    position: 'relative',
  },
  tourImage: {
    width: '100%',
    height: '100%',
  },
  tourLocationBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(13, 27, 46, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tourLocationText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  tourDiscountBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#E8302A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tourDiscountText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  tourCardBody: {
    padding: 14,
  },
  tourName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0D1B2E',
    lineHeight: 20,
    marginBottom: 8,
    minHeight: 40,
  },
  tourMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tourCheckinCount: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  tourPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  tourOldPrice: {
    fontSize: 11,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  tourPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#E8302A',
  },
  bookNowBtn: {
    backgroundColor: '#E8302A',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
  },
  bookNowText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },

  /* FOOTER */
  footerBanner: {
    marginTop: 24,
    marginHorizontal: Spacing.base,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
});
