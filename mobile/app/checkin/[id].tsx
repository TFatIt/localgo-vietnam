import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';

export default function CheckinModal() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [checking, setChecking] = useState(false);
  const { user, updateUser } = useAuthStore();

  const handleConfirmCheckin = () => {
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      if (user) {
        updateUser({
          xp: (user.xp || 0) + 50,
          points: (user.points || 0) + 20,
        });
      }
      Alert.alert('Thành công! 🎉', 'Bạn đã check-in thành công và nhận được +50 XP, +20 điểm thưởng!', [
        { text: 'Tuyệt vời', onPress: () => router.back() },
      ]);
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.card}>
        <Text style={styles.emoji}>📍</Text>
        <Text style={styles.title}>Xác nhận Check-in</Text>
        <Text style={styles.subtitle}>
          Hệ thống sẽ ghi nhận bạn đã ghé thăm địa điểm này và tích lũy XP thăng cấp.
        </Text>

        <TouchableOpacity
          style={styles.checkinButton}
          onPress={handleConfirmCheckin}
          disabled={checking}
          activeOpacity={0.8}
        >
          {checking ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.checkinText}>Xác nhận Check-in ngay</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Đóng</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing['2xl'],
    alignItems: 'center',
    width: '100%',
    maxWidth: 380,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  emoji: { fontSize: 50, marginBottom: Spacing.md },
  title: { fontSize: Typography.fontSize.xl, fontWeight: '800', color: Colors.textPrimary, marginBottom: Spacing.sm },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  checkinButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    width: '100%',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  checkinText: { color: '#FFFFFF', fontSize: Typography.fontSize.base, fontWeight: '700' },
  cancelButton: { padding: Spacing.sm },
  cancelText: { color: Colors.textTertiary, fontSize: Typography.fontSize.sm },
});
