import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import auth from '@react-native-firebase/auth';
import { useAuthStore } from '../../store/authStore';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { XP_LEVELS } from '../../constants';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const currentLevel = XP_LEVELS.find((l) => (user?.xp || 0) >= l.minXp && (user?.xp || 0) < l.maxXp) || XP_LEVELS[0];
  const nextLevel = XP_LEVELS[currentLevel.level] || currentLevel;
  const xpProgress = Math.min(((user?.xp || 0) - currentLevel.minXp) / (nextLevel.maxXp - currentLevel.minXp) * 100, 100);

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          try {
            if (typeof auth === 'function') {
              await auth()?.signOut?.();
            }
          } catch {
            // Ignored
          }
          logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const stats = [
    { label: 'Đã đến', value: user?.visitedPlaces?.length || 0, emoji: '📍' },
    { label: 'Tỉnh thành', value: user?.visitedProvincesCount || 0, emoji: '🗺️' },
    { label: 'Bài đăng', value: user?.postsCount || 0, emoji: '📸' },
    { label: 'Huy hiệu', value: user?.badges?.length || 0, emoji: '🏆' },
  ];

  const menuItems = [
    { icon: '📔', label: 'Nhật ký du lịch', onPress: () => router.push('/journal') },
    { icon: '🔖', label: 'Địa điểm đã lưu', onPress: () => router.push('/bookmarks') },
    { icon: '❤️', label: 'Yêu thích', onPress: () => router.push('/favorites') },
    { icon: '📍', label: 'Lịch sử check-in', onPress: () => router.push('/checkin-history') },
    { icon: '🏆', label: 'Bảng xếp hạng', onPress: () => router.push('/leaderboard') },
    { icon: '⚙️', label: 'Cài đặt', onPress: () => router.push('/settings') },
    { icon: '🚪', label: 'Đăng xuất', onPress: handleLogout, danger: true },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero background */}
        <LinearGradient colors={['#1A2D4A', '#0A0E1A']} style={styles.hero}>
          {/* Avatar section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={{ fontSize: 48 }}>👤</Text>
                </View>
              )}
              <TouchableOpacity style={styles.editAvatarBtn}>
                <Text style={{ fontSize: 14 }}>✏️</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.displayName}>{user?.displayName || 'Du khách'}</Text>
            <Text style={styles.email}>{user?.email}</Text>

            {user?.bio && <Text style={styles.bio}>{user.bio}</Text>}

            {/* Follow stats */}
            <View style={styles.followRow}>
              <TouchableOpacity style={styles.followStat}>
                <Text style={styles.followCount}>{user?.followersCount || 0}</Text>
                <Text style={styles.followLabel}>Người theo dõi</Text>
              </TouchableOpacity>
              <View style={styles.followDivider} />
              <TouchableOpacity style={styles.followStat}>
                <Text style={styles.followCount}>{user?.followingCount || 0}</Text>
                <Text style={styles.followLabel}>Đang theo dõi</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Level & XP card */}
        <View style={styles.levelCard}>
          <View style={styles.levelHeader}>
            <View>
              <Text style={styles.levelBadge}>
                <Text style={{ color: currentLevel.color }}>⬡ </Text>
                Cấp độ {currentLevel.level} • {currentLevel.label}
              </Text>
              <Text style={styles.xpText}>{user?.xp || 0} XP</Text>
            </View>
            <View style={styles.pointsBox}>
              <Text style={styles.pointsValue}>🏅 {user?.points || 0}</Text>
              <Text style={styles.pointsLabel}>điểm</Text>
            </View>
          </View>

          {/* XP Progress bar */}
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${xpProgress}%`, backgroundColor: currentLevel.color }]} />
          </View>
          <Text style={styles.progressLabel}>
            {user?.xp || 0} / {nextLevel.minXp} XP để lên cấp {nextLevel.level}
          </Text>
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <Text style={styles.statEmoji}>{stat.emoji}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Badges */}
        {user?.badges && user.badges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏆 Huy hiệu của tôi</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgesRow}>
              {user.badges.map((badge) => (
                <View key={badge._id} style={[styles.badgeItem, { borderColor: badge.color }]}>
                  <Text style={styles.badgeIcon}>{badge.icon}</Text>
                  <Text style={styles.badgeName}>{badge.name}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Menu */}
        <View style={styles.menuSection}>
          {menuItems.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={[styles.menuLabel, item.danger && { color: Colors.error }]}>
                  {item.label}
                </Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  hero: { paddingTop: 52 },
  avatarSection: { alignItems: 'center', paddingVertical: Spacing['2xl'], paddingHorizontal: Spacing.base },
  avatarWrapper: { position: 'relative', marginBottom: Spacing.md },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  displayName: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.bold,
    marginBottom: 4,
  },
  email: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    marginBottom: Spacing.sm,
  },
  bio: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    textAlign: 'center',
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  followRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xl,
  },
  followStat: { alignItems: 'center' },
  followCount: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
  },
  followLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
  },
  followDivider: { width: 1, height: 30, backgroundColor: Colors.border },
  levelCard: {
    margin: Spacing.base,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    ...Shadows.md,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  levelBadge: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
  },
  xpText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    marginTop: 2,
  },
  pointsBox: { alignItems: 'flex-end' },
  pointsValue: {
    color: Colors.accent,
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
  },
  pointsLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressLabel: {
    color: Colors.textTertiary,
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    gap: 2,
  },
  statEmoji: { fontSize: 20 },
  statValue: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
  },
  statLabel: {
    color: Colors.textTertiary,
    fontSize: 10,
    fontFamily: Typography.fontFamily.regular,
    textAlign: 'center',
  },
  section: { marginBottom: Spacing.base, paddingHorizontal: Spacing.base },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
    marginBottom: Spacing.md,
  },
  badgesRow: { gap: Spacing.md },
  badgeItem: {
    width: 72,
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    backgroundColor: Colors.surface,
    gap: 4,
  },
  badgeIcon: { fontSize: 28 },
  badgeName: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontFamily: Typography.fontFamily.medium,
    textAlign: 'center',
  },
  menuSection: {
    marginHorizontal: Spacing.base,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  menuIcon: { fontSize: 20, width: 28 },
  menuLabel: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
  },
  menuArrow: {
    color: Colors.textTertiary,
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.regular,
  },
});
