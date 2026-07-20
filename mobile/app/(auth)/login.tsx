import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useAuthStore } from '../../store/authStore';
import { authApiService } from '../../services/places.service';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  offlineAccess: false,
});

export default function LoginScreen() {
  const [loading, setLoading] = useState<string | null>(null);
  const { setUser } = useAuthStore();

  const handleLoginSuccess = async (idToken: string) => {
    try {
      const res = await authApiService.login(idToken);
      setUser(res.data.user);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Lỗi', 'Đăng nhập thất bại. Vui lòng thử lại.');
      console.error(error);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading('google');
    try {
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signIn();
      const { idToken } = await GoogleSignin.getTokens();
      if (!idToken) throw new Error('No ID token');

      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(googleCredential);
      const firebaseToken = await userCredential.user.getIdToken();

      await handleLoginSuccess(firebaseToken);
    } catch (error: unknown) {
      if ((error as { code?: string }).code !== 'SIGN_IN_CANCELLED') {
        Alert.alert('Google Sign-In thất bại', 'Vui lòng thử lại.');
      }
    } finally {
      setLoading(null);
    }
  };

  const handleGuestLogin = () => {
    const { setGuest } = useAuthStore.getState();
    setGuest();
    router.replace('/(tabs)');
  };

  const handleEmailLogin = () => router.push('/(auth)/email-login');

  return (
    <LinearGradient colors={['#0A0E1A', '#111827', '#0D1B2E']} style={styles.container}>
      <StatusBar style="light" />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Logo section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>🗺️</Text>
          </View>
          <Text style={styles.appName}>LocalGo Vietnam</Text>
          <Text style={styles.tagline}>Khám phá vẻ đẹp Việt Nam</Text>
        </View>

        {/* Decorative illustration text */}
        <View style={styles.illustrationRow}>
          {['🏖️', '⛰️', '🌊', '🏛️', '☕', '🌿'].map((emoji, i) => (
            <Text key={i} style={[styles.decorEmoji, { opacity: 0.4 + i * 0.1 }]}>{emoji}</Text>
          ))}
        </View>

        {/* Login buttons */}
        <View style={styles.buttonsContainer}>
          <Text style={styles.continueWith}>Tiếp tục với</Text>

          {/* Google */}
          <TouchableOpacity
            style={styles.socialButton}
            onPress={handleGoogleSignIn}
            activeOpacity={0.8}
            disabled={!!loading}
          >
            <View style={styles.socialButtonInner}>
              {loading === 'google' ? (
                <ActivityIndicator color={Colors.textPrimary} />
              ) : (
                <>
                  <Text style={styles.googleIcon}>G</Text>
                  <Text style={styles.socialButtonText}>Tiếp tục với Google</Text>
                </>
              )}
            </View>
          </TouchableOpacity>

          {/* Apple (iOS only) */}
          {Platform.OS === 'ios' && (
            <TouchableOpacity
              style={[styles.socialButton, styles.appleButton]}
              activeOpacity={0.8}
              disabled={!!loading}
              onPress={() => Alert.alert('Apple Login', 'Configure Sign in with Apple in your Firebase project')}
            >
              <View style={styles.socialButtonInner}>
                <Text style={styles.appleIcon}></Text>
                <Text style={[styles.socialButtonText, { color: '#000' }]}>Tiếp tục với Apple</Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Facebook */}
          <TouchableOpacity
            style={[styles.socialButton, styles.facebookButton]}
            activeOpacity={0.8}
            disabled={!!loading}
            onPress={() => Alert.alert('Facebook Login', 'Configure Facebook Login in your Firebase project')}
          >
            <View style={styles.socialButtonInner}>
              <Text style={styles.fbIcon}>f</Text>
              <Text style={styles.socialButtonText}>Tiếp tục với Facebook</Text>
            </View>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>hoặc</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Email */}
          <TouchableOpacity
            style={styles.emailButton}
            onPress={handleEmailLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.emailButtonText}>📧  Đăng nhập bằng Email</Text>
          </TouchableOpacity>

          {/* Guest */}
          <TouchableOpacity style={styles.guestButton} onPress={handleGuestLogin}>
            <Text style={styles.guestButtonText}>Tiếp tục với tư cách khách →</Text>
          </TouchableOpacity>
        </View>

        {/* Terms */}
        <Text style={styles.terms}>
          Bằng cách tiếp tục, bạn đồng ý với{' '}
          <Text style={styles.termsLink}>Điều khoản sử dụng</Text>
          {' '}và{' '}
          <Text style={styles.termsLink}>Chính sách bảo mật</Text>
        </Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    flexGrow: 1,
    padding: Spacing.base,
    paddingTop: 60,
    alignItems: 'center',
  },
  logoSection: { alignItems: 'center', marginBottom: Spacing.xl },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    ...Shadows.lg,
  },
  logoEmoji: { fontSize: 48 },
  appName: {
    fontSize: Typography.fontSize['3xl'],
    fontFamily: Typography.fontFamily.extraBold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  illustrationRow: {
    flexDirection: 'row',
    gap: Spacing.base,
    marginBottom: Spacing['3xl'],
  },
  decorEmoji: { fontSize: 28 },
  buttonsContainer: { width: '100%', gap: Spacing.md },
  continueWith: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  socialButton: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
  },
  socialButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.lg,
  },
  appleButton: { backgroundColor: '#FFFFFF' },
  facebookButton: { backgroundColor: '#1877F2' },
  googleIcon: {
    fontSize: 18,
    fontFamily: Typography.fontFamily.bold,
    color: '#EA4335',
  },
  appleIcon: { fontSize: 20, color: '#000' },
  fbIcon: { fontSize: 20, color: '#FFF', fontFamily: Typography.fontFamily.bold },
  socialButtonText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: {
    color: Colors.textTertiary,
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
  },
  emailButton: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    paddingVertical: Spacing.base,
    alignItems: 'center',
  },
  emailButtonText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.primary,
  },
  guestButton: { paddingVertical: Spacing.sm, alignItems: 'center' },
  guestButtonText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
  },
  terms: {
    marginTop: Spacing['2xl'],
    textAlign: 'center',
    color: Colors.textTertiary,
    fontSize: Typography.fontSize.xs,
    lineHeight: 18,
    paddingBottom: Spacing.xl,
  },
  termsLink: { color: Colors.primary },
});
