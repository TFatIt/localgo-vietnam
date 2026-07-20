import React, { useRef, useCallback } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { placesService } from '../../services/places.service';
import { Colors, Typography, Spacing, BorderRadius, Shadows, CategoryConfig } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.72;
const CARD_HEIGHT = 220;
const SMALL_CARD_WIDTH = width * 0.55;

const CATEGORIES = Object.entries(CategoryConfig).map(([key, val]) => ({
  key,
  ...val,
}));

const StarRating = ({ rating }: { rating: number }) => (
  <Text style={{ fontSize: 11, color: Colors.star }}>
    {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))} {rating.toFixed(1)}
  </Text>
);

const PlaceCard = ({ place, style }: { place: Record<string, unknown>; style?: object }) => (
  <TouchableOpacity
    style={[styles.placeCard, style]}
    activeOpacity={0.9}
    onPress={() => router.push(`/place/${place._id}`)}
  >
    <Image
      source={{ uri: (place.coverImage as string) || 'https://picsum.photos/400/300' }}
      style={styles.placeCardImage}
    />
    <LinearGradient
      colors={['transparent', 'rgba(0,0,0,0.85)']}
      style={StyleSheet.absoluteFill}
    />
    {/* Badges */}
    <View style={styles.cardBadges}>
      {place.isHiddenGem && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>💎 Hidden Gem</Text>
        </View>
      )}
      {place.isTrending && (
        <View style={[styles.badge, { backgroundColor: Colors.primary + 'CC' }]}>
          <Text style={styles.badgeText}>🔥 Trending</Text>
        </View>
      )}
    </View>
    <View style={styles.cardContent}>
      <Text style={styles.cardProvince}>{place.province as string}</Text>
      <Text style={styles.cardName} numberOfLines={2}>{place.name as string}</Text>
      <View style={styles.cardMeta}>
        <StarRating rating={place.communityRating as number || 4.5} />
        <Text style={styles.cardCheckins}>📍 {place.checkinCount as number || 0}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

export default function HomeScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const { user } = useAuthStore();

  const { data: trending, refetch: refetchTrending, isLoading: loadingTrending } = useQuery({
    queryKey: ['trending'],
    queryFn: placesService.getTrending,
  });

  const { data: hiddenGems, refetch: refetchGems } = useQuery({
    queryKey: ['hidden-gems'],
    queryFn: () => placesService.getHiddenGems(),
  });

  const { data: nearby } = useQuery({
    queryKey: ['nearby-home'],
    queryFn: () => placesService.getNearby(10.7769, 106.7009, { limit: 10 }),
    staleTime: 10 * 60 * 1000,
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const trendingPlaces = (trending?.data?.places || []) as Record<string, unknown>[];
  const gemPlaces = (hiddenGems?.data?.places || []) as Record<string, unknown>[];
  const nearbyPlaces = (nearby?.data?.places || []) as Record<string, unknown>[];

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Scroll-reactive solid header */}
      <Animated.View style={[styles.stickyHeader, { opacity: headerOpacity }]}>
        <Text style={styles.stickyHeaderTitle}>LocalGo Vietnam</Text>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: false,
        })}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={loadingTrending}
            onRefresh={() => { refetchTrending(); refetchGems(); }}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Hero Header */}
        <LinearGradient
          colors={['#0D1B2E', '#1A2D4A', '#0A0E1A']}
          style={styles.hero}
        >
          <View style={styles.heroContent}>
            <Text style={styles.greeting}>{greeting()}, {user?.displayName?.split(' ')[0] || 'Du khách'} 👋</Text>
            <Text style={styles.heroTitle}>Hôm nay bạn muốn{'\n'}khám phá đâu?</Text>

            {/* Search bar */}
            <TouchableOpacity
              style={styles.searchBar}
              onPress={() => router.push('/(tabs)/search')}
              activeOpacity={0.9}
            >
              <Text style={styles.searchIcon}>🔍</Text>
              <Text style={styles.searchPlaceholder}>Tìm địa điểm, tỉnh thành...</Text>
              <View style={styles.searchFilterBadge}>
                <Text style={{ fontSize: 12 }}>⚡</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Stats strip */}
          <View style={styles.statsRow}>
            {[
              { label: 'Địa điểm', value: '5,000+', emoji: '📍' },
              { label: 'Tỉnh thành', value: '63', emoji: '🗺️' },
              { label: 'Review', value: '50K+', emoji: '⭐' },
            ].map((stat) => (
              <View key={stat.label} style={styles.statItem}>
                <Text style={styles.statEmoji}>{stat.emoji}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* AI Planner CTA */}
        <TouchableOpacity
          style={styles.aiCta}
          onPress={() => router.push('/ai-planner')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[Colors.secondary + 'CC', Colors.secondary]}
            style={styles.aiCtaGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.aiCtaEmoji}>🤖</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.aiCtaTitle}>AI Lên Kế Hoạch Chuyến Đi</Text>
              <Text style={styles.aiCtaSubtitle}>Nhập điểm đến • Nhận lịch trình ngay</Text>
            </View>
            <Text style={styles.aiCtaArrow}>→</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danh mục</Text>
          <FlatList
            data={CATEGORIES}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: Spacing.base, gap: Spacing.md }}
            keyExtractor={(item) => item.key}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.categoryChip}
                onPress={() => router.push(`/(tabs)/search?category=${item.key}`)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[item.color + '33', item.color + '15']}
                  style={styles.categoryGradient}
                >
                  <Text style={styles.categoryEmoji}>{item.emoji}</Text>
                  <Text style={[styles.categoryLabel, { color: item.color }]}>{item.label}</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Trending */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🔥 Nổi bật tuần này</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/search?isTrending=true')}>
              <Text style={styles.seeAll}>Xem tất cả →</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={trendingPlaces.length > 0 ? trendingPlaces : MOCK_PLACES}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: Spacing.base, gap: Spacing.md }}
            keyExtractor={(item, i) => (item._id as string) || `t${i}`}
            renderItem={({ item }) => (
              <PlaceCard place={item} style={{ width: CARD_WIDTH, height: CARD_HEIGHT }} />
            )}
            snapToInterval={CARD_WIDTH + Spacing.md}
            decelerationRate="fast"
          />
        </View>

        {/* Hidden Gems */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>💎 Hidden Gems</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/search?isHiddenGem=true')}>
              <Text style={styles.seeAll}>Xem tất cả →</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={gemPlaces.length > 0 ? gemPlaces : MOCK_PLACES}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: Spacing.base, gap: Spacing.md }}
            keyExtractor={(item, i) => (item._id as string) || `g${i}`}
            renderItem={({ item }) => (
              <PlaceCard place={item} style={{ width: SMALL_CARD_WIDTH, height: 180 }} />
            )}
          />
        </View>

        {/* Nearby */}
        {nearbyPlaces.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📍 Gần bạn</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/map')}>
                <Text style={styles.seeAll}>Xem bản đồ →</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.nearbyGrid}>
              {nearbyPlaces.slice(0, 4).map((place, i) => (
                <TouchableOpacity
                  key={(place._id as string) || i}
                  style={styles.nearbyCard}
                  onPress={() => router.push(`/place/${place._id}`)}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: (place.coverImage as string) || 'https://picsum.photos/200/150' }}
                    style={styles.nearbyImage}
                  />
                  <View style={styles.nearbyInfo}>
                    <Text style={styles.nearbyName} numberOfLines={1}>{place.name as string}</Text>
                    <Text style={styles.nearbyProvince}>{place.province as string}</Text>
                    <StarRating rating={place.communityRating as number || 4.0} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </Animated.ScrollView>
    </View>
  );
}

// Mock data for when API is not connected
const MOCK_PLACES: Record<string, unknown>[] = [
  { _id: '1', name: 'Vịnh Hạ Long', province: 'Quảng Ninh', coverImage: 'https://picsum.photos/400/300?random=1', communityRating: 4.9, checkinCount: 15420, isHiddenGem: false, isTrending: true },
  { _id: '2', name: 'Phố cổ Hội An', province: 'Quảng Nam', coverImage: 'https://picsum.photos/400/300?random=2', communityRating: 4.8, checkinCount: 12300, isHiddenGem: false, isTrending: true },
  { _id: '3', name: 'Sapa Terraces', province: 'Lào Cai', coverImage: 'https://picsum.photos/400/300?random=3', communityRating: 4.7, checkinCount: 8900, isHiddenGem: true, isTrending: false },
  { _id: '4', name: 'Đảo Phú Quốc', province: 'Kiên Giang', coverImage: 'https://picsum.photos/400/300?random=4', communityRating: 4.8, checkinCount: 11200, isHiddenGem: false, isTrending: true },
  { _id: '5', name: 'Đà Lạt Mộng Mơ', province: 'Lâm Đồng', coverImage: 'https://picsum.photos/400/300?random=5', communityRating: 4.6, checkinCount: 9800, isHiddenGem: false, isTrending: true },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: Colors.backgroundSecondary,
    paddingTop: 52,
    paddingBottom: Spacing.sm,
    paddingHorizontal: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  stickyHeaderTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    textAlign: 'center',
  },
  hero: {
    paddingTop: 60,
    paddingBottom: Spacing.xl,
  },
  heroContent: { paddingHorizontal: Spacing.base },
  greeting: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
    marginBottom: Spacing.xs,
  },
  heroTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize['3xl'],
    fontFamily: Typography.fontFamily.extraBold,
    lineHeight: 38,
    marginBottom: Spacing.base,
    letterSpacing: -0.5,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  searchIcon: { fontSize: 18 },
  searchPlaceholder: {
    flex: 1,
    color: Colors.textTertiary,
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
  },
  searchFilterBadge: {
    backgroundColor: Colors.primary + '20',
    padding: 6,
    borderRadius: BorderRadius.sm,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  statItem: { alignItems: 'center', gap: 2 },
  statEmoji: { fontSize: 20 },
  statValue: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
  },
  statLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
  },
  aiCta: {
    margin: Spacing.base,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.md,
  },
  aiCtaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    gap: Spacing.md,
  },
  aiCtaEmoji: { fontSize: 32 },
  aiCtaTitle: {
    color: '#fff',
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
  },
  aiCtaSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    marginTop: 2,
  },
  aiCtaArrow: {
    color: '#fff',
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
  },
  section: { marginBottom: Spacing.lg },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
  },
  seeAll: {
    color: Colors.primary,
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
  },
  categoryChip: { borderRadius: BorderRadius.xl, overflow: 'hidden' },
  categoryGradient: {
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
    minWidth: 80,
  },
  categoryEmoji: { fontSize: 24 },
  categoryLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semiBold,
    textAlign: 'center',
  },
  placeCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    ...Shadows.lg,
  },
  placeCardImage: { width: '100%', height: '100%', position: 'absolute' },
  cardBadges: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  badge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  badgeText: { color: '#fff', fontSize: 10, fontFamily: Typography.fontFamily.medium },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
  },
  cardProvince: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardName: {
    color: '#fff',
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    marginVertical: 3,
  },
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardCheckins: { color: 'rgba(255,255,255,0.8)', fontSize: Typography.fontSize.xs },
  nearbyGrid: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.md,
  },
  nearbyCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  nearbyImage: { width: 90, height: 80 },
  nearbyInfo: { flex: 1, padding: Spacing.md, justifyContent: 'center', gap: 3 },
  nearbyName: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semiBold,
  },
  nearbyProvince: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
  },
});
