import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';

export default function JournalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nhật ký hành trình</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Hành trình khám phá #{id}</Text>
          <Text style={styles.text}>
            Ghi lại những trải nghiệm và khoảnh khắc đáng nhớ trong chuyến đi của bạn.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingTop: 50 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
  },
  backText: { color: Colors.textSecondary, fontSize: Typography.fontSize.base },
  headerTitle: { color: Colors.textPrimary, fontSize: Typography.fontSize.lg, fontWeight: '700' },
  content: { padding: Spacing.lg },
  card: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  title: { color: Colors.textPrimary, fontSize: Typography.fontSize.lg, fontWeight: '700', marginBottom: Spacing.sm },
  text: { color: Colors.textSecondary, fontSize: Typography.fontSize.base, lineHeight: 22 },
});
