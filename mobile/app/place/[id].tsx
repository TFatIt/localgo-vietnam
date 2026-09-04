import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useQuery } from '@tanstack/react-query';
import { placesService, engagementService } from '../../services/places.service';
import { Colors, Typography, Spacing, BorderRadius, CategoryConfig } from '../../constants/theme';

const { width } = Dimensions.get('window');

export default function PlaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ['place', id],
    queryFn: () => placesService.getPlaceById(id),
    enabled: !!id,
  });

  const place = data?.data?.place || MOCK_PLACE;
  const catConfig = CategoryConfig[place.category];

  const handleShare = async () => {
    await Share.share({
      title: place.name,
      message: `Khám phá ${place.name} tại ${place.province} với LocalGo Vietnam! 🗺️`,
      url: `https://localgo.vn/place/${id}`,
    });
  };

  const handleBookmark = async () => {
    await engagementService.toggleBookmark(id);
  };

  const handleCheckin = () => router.push(`/checkin/${id}`);

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: Colors.textPrimary, fontSize: 40 }}>⏳</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero image */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: place.coverImage || place.images?.[0] || 'https://picsum.photos/400/300' }}
            style={styles.heroImage}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.7)']}
            style={StyleSheet.absoluteFill}
          />

          {/* Back button */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <View style={styles.backBtnInner}>
              <Text style={styles.backBtnText}>←</Text>
            </View>
          </TouchableOpacity>

          {/* Action buttons */}
          <View style={styles.actionBtns}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
              <Text style={styles.actionBtnText}>📤</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, place.isBookmarked && styles.actionBtnActive]} onPress={handleBookmark}>
              <Text style={styles.actionBtnText}>{place.isBookmarked ? '🔖' : '🔖'}</Text>
            </TouchableOpacity>
          </View>

          {/* Hero info */}
          <View style={styles.heroInfo}>
            <View style={styles.heroCategory}>
              <Text style={[styles.heroCategoryText, { color: catConfig?.color || Colors.primary }]}>
                {catConfig?.emoji} {catConfig?.label || place.category}
              </Text>
            </View>
            <Text style={styles.heroTitle}>{place.name}</Text>
            <Text style={styles.heroLocation}>📍 {place.address}, {place.province}</Text>
          </View>
        </View>

        {/* Quick info strip */}
        <View style={styles.quickInfo}>
          <View style={styles.quickInfoItem}>
            <Text style={styles.quickInfoValue}>⭐ {(place.communityRating || 0).toFixed(1)}</Text>
            <Text style={styles.quickInfoLabel}>{place.reviewCount || 0} review</Text>
          </View>
          <View style={styles.quickInfoDivider} />
          <View style={styles.quickInfoItem}>
            <Text style={styles.quickInfoValue}>📍 {place.checkinCount || 0}</Text>
            <Text style={styles.quickInfoLabel}>Check-in</Text>
          </View>
          <View style={styles.quickInfoDivider} />
          <View style={styles.quickInfoItem}>
            <Text style={styles.quickInfoValue}>{place.isVerified ? '✅' : '⬜'}</Text>
            <Text style={styles.quickInfoLabel}>{place.isVerified ? 'Đã xác minh' : 'Chưa xác minh'}</Text>
          </View>
        </View>

        {/* Check-in button */}
        <View style={styles.checkinSection}>
          <TouchableOpacity style={styles.checkinBtn} onPress={handleCheckin}>
            <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.checkinBtnGradient}>
              <Text style={styles.checkinBtnText}>📍  Check-in tại đây  +10 điểm</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Content sections */}
        <View style={styles.content}>
          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📖 Giới thiệu</Text>
            <Text style={styles.description}>{place.description}</Text>
          </View>

          {/* Opening hours */}
          {place.openingHours && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🕐 Giờ mở cửa</Text>
              <View style={styles.hoursContainer}>
                {Object.entries(place.openingHours).map(([day, hours]) => (
                  <View key={day} style={styles.hoursRow}>
                    <Text style={styles.hoursDay}>{day}</Text>
                    <Text style={styles.hoursTime}>{hours as string}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Ticket price */}
          {place.ticketPrice && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎫 Giá vé</Text>
              <View style={styles.ticketContainer}>
                {place.ticketPrice.adult && (
                  <View style={styles.ticketRow}>
                    <Text style={styles.ticketLabel}>Người lớn</Text>
                    <Text style={styles.ticketPrice}>{place.ticketPrice.adult.toLocaleString('vi-VN')} {place.ticketPrice.currency}</Text>
                  </View>
                )}
                {place.ticketPrice.child && (
                  <View style={styles.ticketRow}>
                    <Text style={styles.ticketLabel}>Trẻ em</Text>
                    <Text style={styles.ticketPrice}>{place.ticketPrice.child.toLocaleString('vi-VN')} {place.ticketPrice.currency}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Facilities */}
          {place.facilities?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🏗️ Tiện nghi</Text>
              <View style={styles.tagsRow}>
                {place.facilities.map((f: string, i: number) => (
                  <View key={i} style={styles.tag}>
                    <Text style={styles.tagText}>{f}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Travel tips */}
          {place.travelTips?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💡 Mẹo du lịch</Text>
              {place.travelTips.map((tip: string, i: number) => (
                <View key={i} style={styles.tipRow}>
                  <Text style={styles.tipBullet}>→</Text>
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Best seasons */}
          {place.bestVisitingSeason?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🌤️ Thời điểm tốt nhất</Text>
              <View style={styles.tagsRow}>
                {place.bestVisitingSeason.map((season: string, i: number) => (
                  <View key={i} style={[styles.tag, { backgroundColor: Colors.secondary + '22', borderColor: Colors.secondary + '44' }]}>
                    <Text style={[styles.tagText, { color: Colors.secondary }]}>{season}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Recent reviews */}
          {place.recentReviews?.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>💬 Đánh giá gần đây</Text>
                <TouchableOpacity onPress={() => router.push(`/place/${id}/reviews`)}>
                  <Text style={styles.seeAll}>Xem tất cả →</Text>
                </TouchableOpacity>
              </View>
              {place.recentReviews.map((review: Record<string, unknown>, i: number) => {
                const reviewer = review.userId as Record<string, unknown>;
                return (
                  <View key={i} style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      {reviewer.avatar ? (
                        <Image source={{ uri: reviewer.avatar as string }} style={styles.reviewAvatar} />
                      ) : (
                        <View style={styles.reviewAvatarPlaceholder}><Text>👤</Text></View>
                      )}
                      <View style={{ flex: 1 }}>
                        <Text style={styles.reviewUsername}>{reviewer.displayName as string}</Text>
                        <Text style={{ color: Colors.star }}>{'★'.repeat(review.rating as number)}</Text>
                      </View>
                      <Text style={styles.reviewDate}>
                        {new Date(review.createdAt as string).toLocaleDateString('vi-VN')}
                      </Text>
                    </View>
                    <Text style={styles.reviewBody} numberOfLines={3}>{review.body as string}</Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* Write review button */}
          <TouchableOpacity
            style={styles.writeReviewBtn}
            onPress={() => router.push(`/place/${id}/write-review`)}
          >
            <Text style={styles.writeReviewText}>✏️ Viết đánh giá</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const MOCK_PLACE = {
  _id: '1',
  name: 'Vịnh Hạ Long',
  description: 'Vịnh Hạ Long là một vịnh nhỏ thuộc phần bờ Tây vịnh Bắc Bộ tại khu vực biển Đông Bắc Việt Nam, bao gồm vùng biển của thành phố Hạ Long, thị xã Cẩm Phả và một phần huyện đảo Vân Đồn, tỉnh Quảng Ninh. Đây là di sản thiên nhiên thế giới được UNESCO công nhận.',
  province: 'Quảng Ninh',
  address: 'Vịnh Hạ Long, Quảng Ninh',
  category: 'national_park',
  coverImage: 'https://picsum.photos/400/600?random=1',
  communityRating: 4.9,
  reviewCount: 1520,
  checkinCount: 15420,
  isVerified: true,
  isHiddenGem: false,
  isTrending: true,
  facilities: ['Bãi biển', 'Thuyền kayak', 'Tàu du lịch', 'Nhà nghỉ'],
  travelTips: ['Đặt tour trước ít nhất 2 ngày', 'Mang theo áo mưa vào mùa hè', 'Tốt nhất vào tháng 10-12'],
  bestVisitingSeason: ['Tháng 10 - 12', 'Tháng 3 - 5'],
  openingHours: { 'Hàng ngày': '6:00 - 18:00' },
  ticketPrice: { adult: 270000, child: 135000, currency: 'VND' },
  isBookmarked: false,
  recentReviews: [],
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  heroContainer: { height: 380, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  backBtn: { position: 'absolute', top: 52, left: Spacing.base },
  backBtnInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: { color: '#fff', fontSize: 20 },
  actionBtns: { position: 'absolute', top: 52, right: Spacing.base, gap: Spacing.sm },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnActive: { backgroundColor: Colors.primary + 'CC' },
  actionBtnText: { fontSize: 18 },
  heroInfo: { position: 'absolute', bottom: Spacing.base, left: Spacing.base, right: Spacing.base },
  heroCategory: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: Spacing.xs,
  },
  heroCategoryText: { fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamily.bold },
  heroTitle: { color: '#fff', fontSize: Typography.fontSize['2xl'], fontFamily: Typography.fontFamily.bold, lineHeight: 32 },
  heroLocation: { color: 'rgba(255,255,255,0.8)', fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.regular, marginTop: 4 },
  quickInfo: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  quickInfoItem: { flex: 1, alignItems: 'center' },
  quickInfoValue: { color: Colors.textPrimary, fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamily.bold },
  quickInfoLabel: { color: Colors.textSecondary, fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamily.regular },
  quickInfoDivider: { width: 1, backgroundColor: Colors.border },
  checkinSection: { padding: Spacing.base, paddingBottom: 0 },
  checkinBtn: { borderRadius: BorderRadius.full, overflow: 'hidden' },
  checkinBtnGradient: { paddingVertical: Spacing.base, alignItems: 'center' },
  checkinBtnText: { color: '#fff', fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamily.bold },
  content: { padding: Spacing.base },
  section: { marginBottom: Spacing.xl },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { color: Colors.textPrimary, fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamily.bold, marginBottom: Spacing.md },
  seeAll: { color: Colors.primary, fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.medium },
  description: { color: Colors.textSecondary, fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamily.regular, lineHeight: 22 },
  hoursContainer: { gap: Spacing.sm },
  hoursRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.xs, borderBottomWidth: 1, borderBottomColor: Colors.border },
  hoursDay: { color: Colors.textSecondary, fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamily.medium },
  hoursTime: { color: Colors.textPrimary, fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamily.regular },
  ticketContainer: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, overflow: 'hidden', borderWidth: 1, borderColor: Colors.glassBorder },
  ticketRow: { flexDirection: 'row', justifyContent: 'space-between', padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  ticketLabel: { color: Colors.textSecondary, fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamily.regular },
  ticketPrice: { color: Colors.primary, fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamily.bold },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  tag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  tagText: { color: Colors.textSecondary, fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.medium },
  tipRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  tipBullet: { color: Colors.primary, fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamily.bold, marginTop: 1 },
  tipText: { flex: 1, color: Colors.textSecondary, fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamily.regular, lineHeight: 22 },
  reviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  reviewAvatar: { width: 36, height: 36, borderRadius: 18 },
  reviewAvatarPlaceholder: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.backgroundTertiary, alignItems: 'center', justifyContent: 'center' },
  reviewUsername: { color: Colors.textPrimary, fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamily.semiBold },
  reviewDate: { color: Colors.textTertiary, fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamily.regular },
  reviewBody: { color: Colors.textSecondary, fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamily.regular, lineHeight: 20 },
  writeReviewBtn: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.base,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  writeReviewText: { color: Colors.primary, fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamily.semiBold },
});
