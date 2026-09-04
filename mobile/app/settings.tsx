import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import { useAppStore, useTheme } from '../store/appStore';
import { useAuthStore } from '../store/authStore';

export default function SettingsScreen() {
  const { theme, setTheme, language, setLanguage } = useAppStore();
  const { isDark } = useTheme();
  const { user, logout } = useAuthStore();

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.background : Colors.backgroundLight }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: isDark ? Colors.textPrimary : Colors.textPrimaryLight }]}>← Đóng</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: isDark ? Colors.textPrimary : Colors.textPrimaryLight }]}>Cài đặt</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Giao diện & Ngôn ngữ</Text>
          <View style={[styles.row, { backgroundColor: isDark ? Colors.surface : Colors.surfaceLight }]}>
            <Text style={[styles.rowLabel, { color: isDark ? Colors.textPrimary : Colors.textPrimaryLight }]}>Chế độ tối (Dark Mode)</Text>
            <Switch
              value={theme === 'dark'}
              onValueChange={(val) => setTheme(val ? 'dark' : 'light')}
              thumbColor={Colors.primary}
            />
          </View>

          <View style={[styles.row, { backgroundColor: isDark ? Colors.surface : Colors.surfaceLight }]}>
            <Text style={[styles.rowLabel, { color: isDark ? Colors.textPrimary : Colors.textPrimaryLight }]}>Ngôn ngữ</Text>
            <TouchableOpacity onPress={() => setLanguage(language === 'vi' ? 'en' : 'vi')}>
              <Text style={{ color: Colors.primary, fontWeight: '600' }}>
                {language === 'vi' ? 'Tiếng Việt 🇻🇳' : 'English 🇺🇸'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin ứng dụng</Text>
          <View style={[styles.row, { backgroundColor: isDark ? Colors.surface : Colors.surfaceLight }]}>
            <Text style={[styles.rowLabel, { color: isDark ? Colors.textPrimary : Colors.textPrimaryLight }]}>Phiên bản</Text>
            <Text style={{ color: Colors.textSecondary }}>1.0.0 (LocalGo Vietnam)</Text>
          </View>
        </View>

        {user && (
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => {
              logout();
              router.replace('/(auth)/login');
            }}
          >
            <Text style={styles.logoutText}>Đăng xuất tài khoản</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
  },
  backBtn: { paddingRight: Spacing.md },
  backText: { fontSize: Typography.fontSize.base, fontWeight: '600' },
  title: { fontSize: Typography.fontSize.lg, fontWeight: '700' },
  content: { padding: Spacing.lg, gap: Spacing.xl },
  section: { gap: Spacing.sm },
  sectionTitle: { fontSize: Typography.fontSize.sm, fontWeight: '600', color: Colors.textSecondary, textTransform: 'uppercase' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  rowLabel: { fontSize: Typography.fontSize.base },
  logoutButton: {
    backgroundColor: '#FC4F6220',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FC4F62',
    marginTop: Spacing.lg,
  },
  logoutText: { color: '#FC4F62', fontWeight: '700', fontSize: Typography.fontSize.base },
});
