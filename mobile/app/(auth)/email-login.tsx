import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../../store/authStore';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import api from '../../services/api';

export default function EmailLoginScreen() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }

    if (isRegister && !name.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập họ và tên của bạn.');
      return;
    }

    setLoading(true);
    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const payload = isRegister
        ? { email: email.trim(), password: password.trim(), displayName: name.trim() }
        : { email: email.trim(), password: password.trim() };

      const response = await api.post(endpoint, payload);
      if (response.data?.user) {
        setUser(response.data.user);
      } else {
        // Fallback for dev mode
        setUser({
          _id: 'dev_user_1',
          firebaseUid: 'dev_uid_1',
          email: email.trim(),
          displayName: name.trim() || email.split('@')[0],
          role: 'user',
          travelInterests: ['beach', 'food'],
          points: 100,
          xp: 250,
          level: 1,
          followersCount: 0,
          followingCount: 0,
          postsCount: 0,
          visitedProvincesCount: 1,
          language: 'vi',
          theme: 'dark',
          notificationsEnabled: true,
          badges: [],
        });
      }
      router.replace('/(tabs)');
    } catch (error: any) {
      // If server unreachable or error, allow offline dev login option
      const errorMsg = error.response?.data?.message || error.message || 'Không thể kết nối đến máy chủ.';
      Alert.alert(
        'Đăng nhập thử nghiệm',
        `${errorMsg}\n\nBạn có muốn đăng nhập ở chế độ thử nghiệm nội bộ không?`,
        [
          { text: 'Thử lại', style: 'cancel' },
          {
            text: 'Tiếp tục',
            onPress: () => {
              setUser({
                _id: 'dev_user_mock',
                firebaseUid: 'mock_uid',
                email: email.trim(),
                displayName: name.trim() || email.split('@')[0],
                role: 'user',
                travelInterests: ['beach', 'mountain', 'food'],
                points: 200,
                xp: 500,
                level: 2,
                followersCount: 12,
                followingCount: 8,
                postsCount: 3,
                visitedProvincesCount: 4,
                language: 'vi',
                theme: 'dark',
                notificationsEnabled: true,
                badges: [],
              });
              router.replace('/(tabs)');
            },
          },
        ],
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0A0E1A', '#111827', '#0D1B2E']} style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>← Quay lại</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>{isRegister ? 'Tạo tài khoản' : 'Chào mừng trở lại'}</Text>
            <Text style={styles.subtitle}>
              {isRegister
                ? 'Đăng ký để lưu lịch trình và chia sẻ kinh nghiệm'
                : 'Nhập thông tin tài khoản của bạn để tiếp tục'}
            </Text>
          </View>

          <View style={styles.form}>
            {isRegister && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Họ và tên</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nguyễn Văn A"
                  placeholderTextColor={Colors.textTertiary}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="example@localgo.vn"
                placeholderTextColor={Colors.textTertiary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mật khẩu</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={Colors.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isRegister ? 'Đăng ký ngay' : 'Đăng nhập'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => setIsRegister(!isRegister)}
            >
              <Text style={styles.switchText}>
                {isRegister ? 'Đã có tài khoản? ' : 'Chưa có tài khoản? '}
                <Text style={styles.switchLink}>
                  {isRegister ? 'Đăng nhập' : 'Đăng ký ngay'}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    padding: Spacing.xl,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    flexGrow: 1,
  },
  backButton: {
    marginBottom: Spacing.lg,
  },
  backButtonText: {
    color: Colors.textSecondary,
    fontSize: Typography.base,
  },
  header: {
    marginBottom: Spacing.xxl,
  },
  title: {
    fontSize: Typography.xxxl,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  form: {
    gap: Spacing.lg,
  },
  inputGroup: {
    gap: Spacing.xs,
  },
  label: {
    fontSize: Typography.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    color: Colors.textPrimary,
    fontSize: Typography.base,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.base,
    fontWeight: '700',
  },
  switchButton: {
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  switchText: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
  },
  switchLink: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
