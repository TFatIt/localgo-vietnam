import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ScrollView,
  Animated,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { placesService } from '../../services/places.service';
import { Colors, Typography, Spacing, BorderRadius, CategoryConfig } from '../../constants/theme';
import { VIETNAM_PROVINCES } from '../../constants';

type ViewMode = 'list' | 'map';

const FILTERS = [
  { key: 'all', label: 'Tất cả', emoji: '✨' },
  { key: 'beach', label: 'Biển', emoji: '🏖️' },
  { key: 'mountain', label: 'Núi', emoji: '⛰️' },
  { key: 'camping', label: 'Cắm trại', emoji: '⛺' },
  { key: 'hidden_gem', label: 'Hidden Gem', emoji: '💎' },
  { key: 'cafe', label: 'Cà phê', emoji: '☕' },
  { key: 'restaurant', label: 'Ẩm thực', emoji: '🍜' },
  { key: 'national_park', label: 'Vườn quốc gia', emoji: '🌿' },
];

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showProvinceFilter, setShowProvinceFilter] = useState(false);
  const searchInputRef = useRef<TextInput>(null);

  const buildParams = useCallback(() => {
    const params: Record<string, unknown> = {};
    if (query) params.search = query;
    if (selectedProvince) params.province = selectedProvince;
    if (activeFilter === 'hidden_gem') {
      params.isHiddenGem = true;
    } else if (activeFilter !== 'all') {
      params.category = activeFilter;
    }
    return params;
  }, [query, activeFilter, selectedProvince]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['places-search', query, activeFilter, selectedProvince],
    queryFn: () => placesService.getPlaces(buildParams()),
    staleTime: 2 * 60 * 1000,
  });

  const places = (data?.data || []) as Record<string, unknown>[];

  const renderPlaceItem = ({ item }: { item: Record<string, unknown> }) => (
    <TouchableOpacity
      style={styles.resultCard}
      onPress={() => router.push(`/place/${item._id}`)}
      activeOpacity={0.85}
    >
      <Image
        source={{ uri: (item.coverImage as string) || 'https://picsum.photos/300/200' }}
        style={styles.resultImage}
      />
      <View style={styles.resultContent}>
        <View style={styles.resultHeader}>
          <View>
            <Text style={styles.resultName} numberOfLines={1}>{item.name as string}</Text>
            <Text style={styles.resultLocation}>📍 {item.province as string}</Text>
          </View>
          {(item.isHiddenGem || item.isTrending) && (
            <View style={[
              styles.resultBadge,
              { backgroundColor: item.isHiddenGem ? '#9F7AEA' : Colors.primary },
            ]}>
              <Text style={styles.resultBadgeText}>
                {item.isHiddenGem ? '💎' : '🔥'}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.resultDescription} numberOfLines={2}>
          {item.description as string}
        </Text>
        <View style={styles.resultMeta}>
          <Text style={styles.resultRating}>⭐ {(item.communityRating as number || 0).toFixed(1)}</Text>
          <Text style={styles.resultCheckins}>📍 {item.checkinCount as number || 0} check-in</Text>
          <View style={styles.categoryTag}>
            <Text style={styles.categoryTagText}>
              {CategoryConfig[item.category as string]?.emoji} {CategoryConfig[item.category as string]?.label || item.category as string}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <LinearGradient colors={['#0D1B2E', '#0A0E1A']} style={styles.header}>
        {/* Search input */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Tìm địa điểm, tỉnh thành, thẻ..."
            placeholderTextColor={Colors.textTertiary}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            onSubmitEditing={() => refetch()}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={{ color: Colors.textTertiary, fontSize: 18 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filter pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
        >
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterPill,
                activeFilter === filter.key && styles.filterPillActive,
              ]}
              onPress={() => setActiveFilter(filter.key)}
            >
              <Text style={styles.filterEmoji}>{filter.emoji}</Text>
              <Text style={[
                styles.filterLabel,
                activeFilter === filter.key && { color: '#fff' },
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Secondary filters */}
        <View style={styles.secondaryFilters}>
          <TouchableOpacity
            style={styles.provinceFilter}
            onPress={() => setShowProvinceFilter(!showProvinceFilter)}
          >
            <Text style={styles.provinceFilterText}>
              🗺️ {selectedProvince || 'Tỉnh thành'}
            </Text>
            <Text style={{ color: Colors.textSecondary }}>{showProvinceFilter ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {/* View mode toggle */}
          <View style={styles.viewModeToggle}>
            <TouchableOpacity
              style={[styles.viewModeBtn, viewMode === 'list' && styles.viewModeBtnActive]}
              onPress={() => setViewMode('list')}
            >
              <Text style={{ fontSize: 14 }}>☰</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewModeBtn, viewMode === 'map' && styles.viewModeBtnActive]}
              onPress={() => { setViewMode('map'); router.push('/(tabs)/map'); }}
            >
              <Text style={{ fontSize: 14 }}>🗺️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Province dropdown */}
        {showProvinceFilter && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: Spacing.base, gap: Spacing.sm }}
            style={{ maxHeight: 44 }}
          >
            <TouchableOpacity
              style={[styles.provincePill, !selectedProvince && styles.provincePillActive]}
              onPress={() => { setSelectedProvince(null); setShowProvinceFilter(false); }}
            >
              <Text style={styles.provincePillText}>Tất cả</Text>
            </TouchableOpacity>
            {VIETNAM_PROVINCES.map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.provincePill, selectedProvince === p && styles.provincePillActive]}
                onPress={() => { setSelectedProvince(p); setShowProvinceFilter(false); }}
              >
                <Text style={styles.provincePillText}>{p}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </LinearGradient>

      {/* Results */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.skeleton} />
          ))}
        </View>
      ) : (
        <FlatList
          data={places.length > 0 ? places : MOCK_SEARCH_RESULTS}
          renderItem={renderPlaceItem}
          keyExtractor={(item, i) => (item._id as string) || `r${i}`}
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.resultsCount}>
              {places.length || MOCK_SEARCH_RESULTS.length} địa điểm tìm thấy
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 48 }}>🔍</Text>
              <Text style={styles.emptyTitle}>Không tìm thấy kết quả</Text>
              <Text style={styles.emptySubtitle}>Thử thay đổi bộ lọc hoặc từ khóa</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const MOCK_SEARCH_RESULTS: Record<string, unknown>[] = [
  { _id: '1', name: 'Vịnh Hạ Long', province: 'Quảng Ninh', coverImage: 'https://picsum.photos/300/200?random=1', communityRating: 4.9, checkinCount: 15420, category: 'national_park', description: 'Di sản thiên nhiên thế giới với hàng nghìn đảo đá vôi.', isHiddenGem: false, isTrending: true },
  { _id: '2', name: 'Phố cổ Hội An', province: 'Quảng Nam', coverImage: 'https://picsum.photos/300/200?random=2', communityRating: 4.8, checkinCount: 12300, category: 'historical', description: 'Thành phố cổ được UNESCO công nhận là di sản văn hóa thế giới.', isHiddenGem: false, isTrending: true },
  { _id: '3', name: 'Ruộng bậc thang Mù Cang Chải', province: 'Yên Bái', coverImage: 'https://picsum.photos/300/200?random=3', communityRating: 4.8, checkinCount: 7800, category: 'mountain', description: 'Những thửa ruộng bậc thang tuyệt đẹp vào mùa lúa chín.', isHiddenGem: true, isTrending: false },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 52, paddingBottom: Spacing.md },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm + 2,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    gap: Spacing.sm,
  },
  searchIcon: { fontSize: 18 },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
  },
  filtersRow: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  filterPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterEmoji: { fontSize: 14 },
  filterLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
  },
  secondaryFilters: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
  },
  provinceFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  provinceFilterText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
  },
  viewModeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
  },
  viewModeBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
  },
  viewModeBtnActive: { backgroundColor: Colors.primary },
  provincePill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  provincePillActive: { backgroundColor: Colors.secondary },
  provincePillText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
  },
  resultsList: { padding: Spacing.base, gap: Spacing.md },
  resultsCount: {
    color: Colors.textTertiary,
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    marginBottom: Spacing.sm,
  },
  resultCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  resultImage: { width: 110, height: 120 },
  resultContent: { flex: 1, padding: Spacing.md, justifyContent: 'space-between' },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  resultName: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.bold,
    flex: 1,
  },
  resultLocation: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    marginTop: 2,
  },
  resultBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultBadgeText: { fontSize: 14 },
  resultDescription: {
    color: Colors.textTertiary,
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    lineHeight: 16,
    marginVertical: Spacing.xs,
  },
  resultMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap' },
  resultRating: { color: Colors.star, fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamily.medium },
  resultCheckins: { color: Colors.textTertiary, fontSize: Typography.fontSize.xs },
  categoryTag: {
    backgroundColor: Colors.backgroundTertiary,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  categoryTagText: { color: Colors.textSecondary, fontSize: 10 },
  loadingContainer: { padding: Spacing.base, gap: Spacing.md },
  skeleton: {
    height: 120,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    opacity: 0.5,
  },
  emptyState: { alignItems: 'center', paddingTop: Spacing['4xl'], gap: Spacing.md },
  emptyTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
  },
  emptySubtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
  },
});
