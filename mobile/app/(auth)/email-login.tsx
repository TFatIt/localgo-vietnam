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
  const [phone, setPhone] = useState('');
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

    if (password.length < 6) {
      Alert.alert('Thông báo', 'Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    setLoading(true);
    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const payload = isRegister
        ? { email: email.trim(), password: password.trim(), displayName: name.trim(), phone: phone.trim() }
        : { email: email.trim(), password: password.trim() };

      const response = await api.post(endpoint, payload);
      const userData = response.data?.data?.user || response.data?.user;

      if (userData) {
        setUser(userData);
        Alert.alert('Thành công', isRegister ? 'Đăng ký tài khoản thành công!' : 'Đăng nhập thành công!');
        router.replace('/(tabs)');
      } else {
        // Fallback user
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
          theme: 'light',
          notificationsEnabled: true,
          badges: [],
        });
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Không thể kết nối đến máy chủ.';
      Alert.alert('Thông báo', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>← Quay lại trang chủ</Text>
          </TouchableOpacity>

          <View style={styles.cardBox}>
            <View style={styles.header}>
              <View style={styles.flagBadge}>
                <Text style={{ fontSize: 32 }}>🇻🇳</Text>
              </View>
              <Text style={styles.title}>
                {isRegister ? 'Đăng Ký Thành Viên' : 'Đăng Nhập Du Lịch Việt'}
              </Text>
              <Text style={styles.subtitle}>
                {isRegister
                  ? 'Tạo tài khoản để nhận ưu đãi tour hè và tích lũy điểm thưởng'
                  : 'Nhập thông tin tài khoản của bạn để khám phá Việt Nam'}
              </Text>
            </View>

            <View style={styles.form}>
              {isRegister && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Họ và tên (*)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="VD: Nguyễn Văn An"
                    placeholderTextColor="#94A3B8"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email (*)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="VD: an.nguyen@gmail.com"
                  placeholderTextColor="#94A3B8"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {isRegister && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Số điện thoại (tùy chọn)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="VD: 0912 345 678"
                    placeholderTextColor="#94A3B8"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mật khẩu (*)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="•••••••• (Ít nhất 6 ký tự)"
                  placeholderTextColor="#94A3B8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {isRegister ? 'ĐĂNG KÝ TÀI KHOẢN NGAY' : 'ĐĂNG NHẬP NGAY'}
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
                    {isRegister ? 'Đăng nhập ngay' : 'Đăng ký ngay'}
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F9',
  },
  scroll: {
    padding: Spacing.base,
    paddingTop: Platform.OS === 'ios' ? 60 : 36,
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
    paddingHorizontal: 4,
  },
  backButtonText: {
    color: '#E8302A',
    fontSize: 14,
    fontWeight: '700',
  },
  cardBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 460,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  flagBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FED7D7',
  },
  title: {
    color: '#0D1B2E',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    color: '#64748B',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  form: {
    gap: Spacing.md,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    color: '#0D1B2E',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#0D1B2E',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#E8302A',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#E8302A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  switchButton: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  switchText: {
    color: '#64748B',
    fontSize: 13,
  },
  switchLink: {
    color: '#E8302A',
    fontWeight: '800',
  },
});
