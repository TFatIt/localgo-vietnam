import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../../store/authStore';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Khám Phá Việt Nam',
    titleEn: 'Discover Vietnam',
    subtitle: 'Tìm kiếm những địa điểm tuyệt vời\ntừ biển đến núi, từ làng quê đến phố thị',
    subtitleEn: 'Find amazing places from beaches to mountains,\nfrom rural villages to vibrant cities',
    emoji: '🗺️',
    gradient: ['#0A0E1A', '#1A1035', '#0D1B3E'],
    accentColor: Colors.primary,
    features: ['🏖️ Bãi biển đẹp', '⛰️ Núi hùng vĩ', '🌿 Vườn quốc gia'],
  },
  {
    id: '2',
    title: 'AI Lên Kế Hoạch',
    titleEn: 'AI Travel Planner',
    subtitle: 'Để AI LocalGo lên lịch trình hoàn hảo\ncho chuyến đi của bạn',
    subtitleEn: 'Let LocalGo AI create the perfect itinerary\nfor your dream trip',
    emoji: '🤖',
    gradient: ['#0A0E1A', '#0D1B35', '#1A0D35'],
    accentColor: Colors.secondary,
    features: ['📅 Lịch trình chi tiết', '💰 Tính toán chi phí', '🗺️ Tuyến đường Google Maps'],
  },
  {
    id: '3',
    title: 'Cộng Đồng Phượt',
    titleEn: 'Traveler Community',
    subtitle: 'Chia sẻ kỷ niệm, kết nối với\ncộng đồng phượt thủ Việt Nam',
    subtitleEn: 'Share memories, connect with\nVietnam\'s travel community',
    emoji: '🌟',
    gradient: ['#0A0E1A', '#1A100D', '#2D1A0A'],
    accentColor: Colors.accent,
    features: ['📸 Chia sẻ khoảnh khắc', '🏆 Tích điểm huy hiệu', '👥 Kết nối bạn bè'],
  },
];

export default function WelcomeScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const { setOnboardingComplete } = useAuthStore();

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => handleGetStarted();

  const handleGetStarted = () => {
    setOnboardingComplete();
    router.replace('/(auth)/login');
  };

  const renderSlide = ({ item }: { item: typeof SLIDES[0] }) => (
    <View style={styles.slide}>
      <LinearGradient colors={item.gradient as [string, string, string]} style={StyleSheet.absoluteFill} />

      {/* Background emoji decoration */}
      <Text style={styles.bgEmoji}>{item.emoji}</Text>

      <View style={styles.content}>
        {/* Main emoji */}
        <View style={[styles.emojiContainer, { borderColor: item.accentColor + '40' }]}>
          <Text style={styles.mainEmoji}>{item.emoji}</Text>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: item.accentColor }]}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>

        {/* Features */}
        <View style={styles.featuresContainer}>
          {item.features.map((feature, i) => (
            <View key={i} style={[styles.featureChip, { borderColor: item.accentColor + '30', backgroundColor: item.accentColor + '15' }]}>
              <Text style={[styles.featureText, { color: item.accentColor }]}>{feature}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderDot = (_: unknown, index: number) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    const dotWidth = scrollX.interpolate({
      inputRange,
      outputRange: [8, 24, 8],
      extrapolate: 'clamp',
    });
    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.4, 1, 0.4],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        key={index}
        style={[styles.dot, { width: dotWidth, opacity, backgroundColor: SLIDES[currentIndex].accentColor }]}
      />
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Skip button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Bỏ qua</Text>
      </TouchableOpacity>

      {/* Slides */}
      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        onMomentumScrollEnd={(e) => {
          setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
        scrollEventThrottle={16}
      />

      {/* Bottom controls */}
      <View style={styles.bottomContainer}>
        {/* Pagination dots */}
        <View style={styles.pagination}>
          {SLIDES.map(renderDot)}
        </View>

        {/* CTA Button */}
        <TouchableOpacity onPress={handleNext} activeOpacity={0.8}>
          <LinearGradient
            colors={[SLIDES[currentIndex].accentColor, SLIDES[currentIndex].accentColor + 'CC']}
            style={styles.ctaButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.ctaText}>
              {currentIndex === SLIDES.length - 1 ? '🚀  Bắt đầu khám phá' : 'Tiếp theo →'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  slide: { width, height, alignItems: 'center', justifyContent: 'center' },
  bgEmoji: {
    position: 'absolute',
    fontSize: 280,
    opacity: 0.04,
    top: '10%',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['2xl'],
    paddingTop: 100,
  },
  emojiContainer: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  mainEmoji: { fontSize: 60 },
  title: {
    fontSize: Typography.fontSize['3xl'],
    fontFamily: Typography.fontFamily.extraBold,
    textAlign: 'center',
    marginBottom: Spacing.md,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing['2xl'],
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  featureChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  featureText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: Spacing.base,
    zIndex: 10,
    padding: Spacing.sm,
  },
  skipText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
  },
  bottomContainer: {
    paddingBottom: 48,
    paddingHorizontal: Spacing.base,
    alignItems: 'center',
    gap: Spacing.lg,
  },
  pagination: {
    flexDirection: 'row',
    gap: Spacing.xs,
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: BorderRadius.full,
  },
  ctaButton: {
    paddingHorizontal: Spacing['3xl'],
    paddingVertical: Spacing.base,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    minWidth: 220,
    ...{
      shadowColor: '#FF6B35',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: 0.3,
  },
});
