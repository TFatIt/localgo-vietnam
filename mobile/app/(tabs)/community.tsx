import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  TextInput,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { communityService } from '../../services/places.service';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';

const { width } = Dimensions.get('window');

type PostType = 'all' | 'photo' | 'video' | 'story';

const POST_TABS: { key: PostType; label: string; emoji: string }[] = [
  { key: 'all', label: 'Tất cả', emoji: '✨' },
  { key: 'photo', label: 'Ảnh', emoji: '📸' },
  { key: 'video', label: 'Video', emoji: '🎬' },
  { key: 'story', label: 'Story', emoji: '⭕' },
];

const PostCard = ({
  post,
  onLike,
  currentUserId,
}: {
  post: Record<string, unknown>;
  onLike: (id: string) => void;
  currentUserId?: string;
}) => {
  const user = post.userId as Record<string, unknown>;
  const media = post.media as string[];
  const place = post.placeId as Record<string, unknown> | undefined;

  return (
    <View style={styles.postCard}>
      {/* Header */}
      <View style={styles.postHeader}>
        <TouchableOpacity
          style={styles.postUserInfo}
          onPress={() => router.push(`/profile/${user?._id}`)}
        >
          {user?.avatar ? (
            <Image source={{ uri: user.avatar as string }} style={styles.postAvatar} />
          ) : (
            <View style={styles.postAvatarPlaceholder}>
              <Text style={{ fontSize: 18 }}>👤</Text>
            </View>
          )}
          <View>
            <Text style={styles.postUsername}>{user?.displayName as string}</Text>
            {place && (
              <TouchableOpacity onPress={() => router.push(`/place/${place._id}`)}>
                <Text style={styles.postPlaceName}>📍 {place.name as string}</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={{ color: Colors.textSecondary, fontSize: 20 }}>···</Text>
        </TouchableOpacity>
      </View>

      {/* Media */}
      {media && media.length > 0 && (
        <Image
          source={{ uri: media[0] || 'https://picsum.photos/400/400' }}
          style={styles.postMedia}
          resizeMode="cover"
        />
      )}

      {/* Actions */}
      <View style={styles.postActions}>
        <View style={styles.postActionsLeft}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onLike(post._id as string)}
          >
            <Text style={styles.actionEmoji}>{post.isLiked ? '❤️' : '🤍'}</Text>
            <Text style={styles.actionCount}>{post.likesCount as number || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionEmoji}>💬</Text>
            <Text style={styles.actionCount}>{post.commentsCount as number || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionEmoji}>📤</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity>
          <Text style={styles.actionEmoji}>🔖</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.postContent}>
        {post.content && (
          <Text style={styles.postText} numberOfLines={3}>
            <Text style={styles.postTextBold}>{user?.displayName as string} </Text>
            {post.content as string}
          </Text>
        )}

        {/* Tags */}
        {(post.tags as string[])?.length > 0 && (
          <View style={styles.postTags}>
            {(post.tags as string[]).map((tag, i) => (
              <Text key={i} style={styles.postTag}>#{tag}</Text>
            ))}
          </View>
        )}

        <Text style={styles.postTime}>
          {new Date(post.createdAt as string).toLocaleDateString('vi-VN')}
        </Text>
      </View>
    </View>
  );
};

export default function CommunityScreen() {
  const [activeTab, setActiveTab] = useState<PostType>('all');
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['community-feed', activeTab],
    queryFn: () => communityService.getFeed({
      type: activeTab !== 'all' ? activeTab : undefined,
    }),
  });

  const likeMutation = useMutation({
    mutationFn: communityService.toggleLike,
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ['community-feed'] });
      // Optimistic update
      queryClient.setQueryData(['community-feed', activeTab], (old: unknown) => {
        const oldData = old as { data?: { data?: Record<string, unknown>[] } };
        if (!oldData?.data?.data) return old;
        return {
          ...oldData,
          data: {
            ...oldData.data,
            data: oldData.data.data.map((p) =>
              p._id === postId
                ? { ...p, isLiked: !p.isLiked, likesCount: (p.likesCount as number) + (p.isLiked ? -1 : 1) }
                : p
            ),
          },
        };
      });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['community-feed'] }),
  });

  const posts = (data?.data?.data || MOCK_POSTS) as Record<string, unknown>[];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <LinearGradient colors={['#0D1B2E', '#0A0E1A']} style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Cộng đồng 🌏</Text>
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => router.push('/create-post')}
          >
            <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.createBtnGradient}>
              <Text style={styles.createBtnText}>+ Đăng</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {POST_TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={styles.tabEmoji}>{tab.emoji}</Text>
              <Text style={[styles.tabLabel, activeTab === tab.key && { color: Colors.primary }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <FlatList
        data={posts}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onLike={(id) => likeMutation.mutate(id)}
            currentUserId={user?._id}
          />
        )}
        keyExtractor={(item, i) => (item._id as string) || `p${i}`}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.primary} />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />
    </View>
  );
}

const MOCK_POSTS: Record<string, unknown>[] = [
  {
    _id: '1',
    userId: { _id: 'u1', displayName: 'Minh Phương', avatar: 'https://i.pravatar.cc/150?img=1' },
    placeId: { _id: 'p1', name: 'Vịnh Hạ Long' },
    type: 'photo',
    content: 'Cảnh đẹp không thể tả 😍 Hạ Long mãi là tuyệt vời nhất! #halong #vietnam #travel',
    media: ['https://picsum.photos/400/400?random=10'],
    tags: ['halong', 'vietnam', 'travel'],
    likesCount: 342,
    commentsCount: 28,
    isLiked: false,
    createdAt: new Date().toISOString(),
  },
  {
    _id: '2',
    userId: { _id: 'u2', displayName: 'Thùy Dương', avatar: 'https://i.pravatar.cc/150?img=5' },
    placeId: { _id: 'p2', name: 'Phố cổ Hội An' },
    type: 'photo',
    content: 'Hội An về đêm đẹp như tranh vẽ 🏮 Đèn lồng rực rỡ khắp phố cổ',
    media: ['https://picsum.photos/400/400?random=11'],
    tags: ['hoian', 'lantern', 'oldtown'],
    likesCount: 567,
    commentsCount: 45,
    isLiked: true,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 52, paddingBottom: Spacing.sm },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.md,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
  },
  createBtn: { borderRadius: BorderRadius.full, overflow: 'hidden' },
  createBtnGradient: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  createBtnText: {
    color: '#fff',
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: Colors.primary },
  tabEmoji: { fontSize: 14 },
  tabLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
  },
  postCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  postUserInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  postAvatar: { width: 40, height: 40, borderRadius: 20 },
  postAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postUsername: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semiBold,
  },
  postPlaceName: {
    color: Colors.primary,
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
  },
  postMedia: { width, height: width, backgroundColor: Colors.surface },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  postActionsLeft: { flexDirection: 'row', gap: Spacing.base },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionEmoji: { fontSize: 22 },
  actionCount: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
  },
  postContent: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.md },
  postText: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    lineHeight: 20,
  },
  postTextBold: { fontFamily: Typography.fontFamily.bold },
  postTags: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginTop: Spacing.xs },
  postTag: {
    color: Colors.secondary,
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
  },
  postTime: {
    color: Colors.textTertiary,
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    marginTop: Spacing.xs,
  },
});
