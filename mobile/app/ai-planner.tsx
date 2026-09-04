import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useForm, Controller } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { aiService } from '../services/places.service';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';
import { VIETNAM_PROVINCES, TRAVEL_STYLES, COMPANION_TYPES, TRANSPORTATION } from '../constants';

interface PlannerForm {
  destination: string;
  numberOfDays: number;
  budget: number;
  travelStyle: string;
  companions: string;
  transportation: string[];
  foodPreference: string[];
  specialRequests?: string;
}

const FOOD_PREFS = [
  { value: 'local', label: 'Ẩm thực địa phương', emoji: '🍜' },
  { value: 'seafood', label: 'Hải sản', emoji: '🦞' },
  { value: 'vegetarian', label: 'Chay', emoji: '🥗' },
  { value: 'street_food', label: 'Đồ ăn đường phố', emoji: '🌮' },
  { value: 'fine_dining', label: 'Nhà hàng cao cấp', emoji: '🍽️' },
  { value: 'cafe', label: 'Cà phê', emoji: '☕' },
];

export default function AIPlannerScreen() {
  const [step, setStep] = useState(1);
  const [selectedTransport, setSelectedTransport] = useState<string[]>([]);
  const [selectedFood, setSelectedFood] = useState<string[]>([]);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  const { control, handleSubmit, formState: { errors }, watch } = useForm<PlannerForm>({
    defaultValues: {
      destination: '',
      numberOfDays: 3,
      budget: 3000000,
      travelStyle: 'moderate',
      companions: 'solo',
      transportation: [],
      foodPreference: [],
    },
  });

  const planMutation = useMutation({
    mutationFn: (data: PlannerForm) => aiService.generatePlan({
      ...data,
      transportation: selectedTransport,
      foodPreference: selectedFood,
    }),
    onSuccess: (res) => {
      setResult(res.data?.itinerary);
      setStep(3);
    },
    onError: () => {
      Alert.alert('Lỗi', 'Không thể tạo kế hoạch. Vui lòng thử lại.');
    },
  });

  const toggleTransport = (value: string) => {
    setSelectedTransport((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const toggleFood = (value: string) => {
    setSelectedFood((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const onSubmit = (data: PlannerForm) => planMutation.mutate(data);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar style="light" />

      {/* Header */}
      <LinearGradient colors={['#0D1B2E', '#0A0E1A']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>🤖 AI Lên Kế Hoạch</Text>
          <Text style={styles.headerSubtitle}>Powered by Google Gemini 🇻🇳</Text>
        </View>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {/* Progress steps */}
      {step < 3 && (
        <View style={styles.progressContainer}>
          {[1, 2].map((s) => (
            <View key={s} style={styles.stepWrapper}>
              <View style={[styles.stepDot, step >= s && styles.stepDotActive]}>
                <Text style={[styles.stepNum, step >= s && { color: '#fff' }]}>{s}</Text>
              </View>
              {s < 2 && <View style={[styles.stepLine, step > s && styles.stepLineActive]} />}
            </View>
          ))}
        </View>
      )}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ---- STEP 1: Basic info ---- */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>📍 Điểm đến & Lịch trình</Text>

            {/* Destination */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Điểm đến *</Text>
              <Controller
                control={control}
                name="destination"
                rules={{ required: 'Vui lòng nhập điểm đến' }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.textInput, errors.destination && styles.inputError]}
                    placeholder="VD: Đà Lạt, Hội An, Phú Quốc..."
                    placeholderTextColor={Colors.textTertiary}
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
              {errors.destination && <Text style={styles.errorText}>{errors.destination.message}</Text>}
            </View>

            {/* Number of days */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Số ngày</Text>
              <Controller
                control={control}
                name="numberOfDays"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.daySelector}>
                    {[1, 2, 3, 4, 5, 7, 10, 14].map((d) => (
                      <TouchableOpacity
                        key={d}
                        style={[styles.dayChip, value === d && styles.dayChipActive]}
                        onPress={() => onChange(d)}
                      >
                        <Text style={[styles.dayChipText, value === d && { color: '#fff' }]}>{d}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              />
            </View>

            {/* Budget */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Ngân sách (VND)</Text>
              <Controller
                control={control}
                name="budget"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.budgetOptions}>
                    {[
                      { label: '< 2 triệu', value: 1500000 },
                      { label: '2-5 triệu', value: 3500000 },
                      { label: '5-10 triệu', value: 7500000 },
                      { label: '> 10 triệu', value: 15000000 },
                    ].map((opt) => (
                      <TouchableOpacity
                        key={opt.value}
                        style={[styles.budgetChip, value === opt.value && styles.budgetChipActive]}
                        onPress={() => onChange(opt.value)}
                      >
                        <Text style={[styles.budgetChipText, value === opt.value && { color: '#fff' }]}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              />
            </View>

            <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(2)}>
              <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.nextBtnGradient}>
                <Text style={styles.nextBtnText}>Tiếp theo →</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* ---- STEP 2: Preferences ---- */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>🎒 Phong cách & Sở thích</Text>

            {/* Travel style */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Phong cách du lịch</Text>
              <Controller
                control={control}
                name="travelStyle"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.chipGrid}>
                    {TRAVEL_STYLES.map((s) => (
                      <TouchableOpacity
                        key={s.value}
                        style={[styles.chip, value === s.value && styles.chipActive]}
                        onPress={() => onChange(s.value)}
                      >
                        <Text style={[styles.chipText, value === s.value && { color: '#fff' }]}>{s.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              />
            </View>

            {/* Companions */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Đi cùng ai</Text>
              <Controller
                control={control}
                name="companions"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.chipGrid}>
                    {COMPANION_TYPES.map((c) => (
                      <TouchableOpacity
                        key={c.value}
                        style={[styles.chip, value === c.value && styles.chipActive]}
                        onPress={() => onChange(c.value)}
                      >
                        <Text style={[styles.chipText, value === c.value && { color: '#fff' }]}>
                          {c.emoji} {c.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              />
            </View>

            {/* Transportation */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Phương tiện</Text>
              <View style={styles.chipGrid}>
                {TRANSPORTATION.map((t) => (
                  <TouchableOpacity
                    key={t.value}
                    style={[styles.chip, selectedTransport.includes(t.value) && styles.chipActive]}
                    onPress={() => toggleTransport(t.value)}
                  >
                    <Text style={[styles.chipText, selectedTransport.includes(t.value) && { color: '#fff' }]}>
                      {t.emoji} {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Food preferences */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Sở thích ẩm thực</Text>
              <View style={styles.chipGrid}>
                {FOOD_PREFS.map((f) => (
                  <TouchableOpacity
                    key={f.value}
                    style={[styles.chip, selectedFood.includes(f.value) && styles.chipActive]}
                    onPress={() => toggleFood(f.value)}
                  >
                    <Text style={[styles.chipText, selectedFood.includes(f.value) && { color: '#fff' }]}>
                      {f.emoji} {f.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.backStepBtn} onPress={() => setStep(1)}>
                <Text style={styles.backStepText}>← Quay lại</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.generateBtn, planMutation.isPending && styles.generateBtnDisabled]}
                onPress={handleSubmit(onSubmit)}
                disabled={planMutation.isPending}
              >
                <LinearGradient colors={[Colors.secondary, Colors.secondaryDark]} style={styles.generateBtnGradient}>
                  {planMutation.isPending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.generateBtnText}>✨ Tạo kế hoạch</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {planMutation.isPending && (
              <View style={styles.loadingInfo}>
                <Text style={styles.loadingText}>🤖 AI đang lên kế hoạch cho bạn...</Text>
                <Text style={styles.loadingSubtext}>Quá trình này mất khoảng 15-30 giây</Text>
              </View>
            )}
          </View>
        )}

        {/* ---- STEP 3: Result ---- */}
        {step === 3 && result && (
          <View style={styles.resultContainer}>
            {/* Summary card */}
            <LinearGradient colors={[Colors.secondary + '33', Colors.secondary + '11']} style={styles.resultSummary}>
              <Text style={styles.resultTitle}>{result.title as string}</Text>
              <Text style={styles.resultDestination}>📍 {result.destination as string}</Text>
              <View style={styles.resultStats}>
                <Text style={styles.resultStat}>💰 {((result.totalEstimatedCost as number) || 0).toLocaleString('vi-VN')} VND</Text>
                <Text style={styles.resultStat}>📅 {result.numberOfDays as number} ngày</Text>
              </View>
            </LinearGradient>

            {/* Weather advice */}
            {result.weatherAdvice && (
              <View style={styles.adviceCard}>
                <Text style={styles.adviceEmoji}>🌤️</Text>
                <Text style={styles.adviceText}>{result.weatherAdvice as string}</Text>
              </View>
            )}

            {/* Daily timeline */}
            {(result.days as Record<string, unknown>[])?.map((day, i) => (
              <View key={i} style={styles.dayCard}>
                <View style={styles.dayHeader}>
                  <View style={styles.dayBadge}>
                    <Text style={styles.dayBadgeText}>Ngày {day.day as number}</Text>
                  </View>
                  <Text style={styles.dayTitle}>{day.title as string}</Text>
                </View>

                {(day.timeline as Record<string, unknown>[])?.map((activity, j) => (
                  <View key={j} style={styles.timelineItem}>
                    <Text style={styles.timelineTime}>{activity.time as string}</Text>
                    <View style={styles.timelineDot} />
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineActivity}>{activity.activity as string}</Text>
                      {activity.placeName && (
                        <Text style={styles.timelinePlace}>📍 {activity.placeName as string}</Text>
                      )}
                      {activity.cost && (
                        <Text style={styles.timelineCost}>💰 {(activity.cost as number).toLocaleString('vi-VN')} VND</Text>
                      )}
                    </View>
                  </View>
                ))}

                <Text style={styles.dayCost}>
                  Chi phí dự kiến: {(day.estimatedCost as number || 0).toLocaleString('vi-VN')} VND
                </Text>
              </View>
            ))}

            {/* Packing checklist */}
            {(result.packingChecklist as string[])?.length > 0 && (
              <View style={styles.checklistCard}>
                <Text style={styles.checklistTitle}>🎒 Danh sách đồ cần mang</Text>
                {(result.packingChecklist as string[]).map((item, i) => (
                  <Text key={i} style={styles.checklistItem}>✓ {item}</Text>
                ))}
              </View>
            )}

            {/* Actions */}
            <View style={styles.resultActions}>
              <TouchableOpacity style={styles.newPlanBtn} onPress={() => { setStep(1); setResult(null); }}>
                <Text style={styles.newPlanBtnText}>🔄 Tạo kế hoạch mới</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.savePlanBtn}>
                <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.savePlanBtnGradient}>
                  <Text style={styles.savePlanBtnText}>💾 Lưu kế hoạch</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingTop: 52,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: { width: 40, padding: Spacing.sm },
  backBtnText: { color: Colors.textPrimary, fontSize: 22 },
  headerCenter: { alignItems: 'center' },
  headerTitle: { color: Colors.textPrimary, fontSize: Typography.fontSize.lg, fontFamily: Typography.fontFamily.bold },
  headerSubtitle: { color: Colors.secondary, fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamily.medium },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: 0,
  },
  stepWrapper: { flexDirection: 'row', alignItems: 'center' },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  stepNum: { color: Colors.textSecondary, fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.bold },
  stepLine: { width: 60, height: 2, backgroundColor: Colors.border },
  stepLineActive: { backgroundColor: Colors.primary },
  content: { padding: Spacing.base },
  stepContainer: { gap: Spacing.xl },
  stepTitle: { color: Colors.textPrimary, fontSize: Typography.fontSize.xl, fontFamily: Typography.fontFamily.bold },
  fieldGroup: { gap: Spacing.sm },
  fieldLabel: { color: Colors.textSecondary, fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamily.medium },
  textInput: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  inputError: { borderColor: Colors.error },
  errorText: { color: Colors.error, fontSize: Typography.fontSize.xs },
  daySelector: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  dayChip: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  dayChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  dayChipText: { color: Colors.textSecondary, fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamily.bold },
  budgetOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  budgetChip: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  budgetChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  budgetChipText: { color: Colors.textSecondary, fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.medium },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { color: Colors.textSecondary, fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.medium },
  nextBtn: { borderRadius: BorderRadius.lg, overflow: 'hidden', ...Shadows.md },
  nextBtnGradient: { paddingVertical: Spacing.base, alignItems: 'center' },
  nextBtnText: { color: '#fff', fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamily.bold },
  buttonRow: { flexDirection: 'row', gap: Spacing.md },
  backStepBtn: {
    flex: 1,
    paddingVertical: Spacing.base,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    alignItems: 'center',
  },
  backStepText: { color: Colors.textSecondary, fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamily.medium },
  generateBtn: { flex: 2, borderRadius: BorderRadius.lg, overflow: 'hidden' },
  generateBtnDisabled: { opacity: 0.7 },
  generateBtnGradient: { paddingVertical: Spacing.base, alignItems: 'center' },
  generateBtnText: { color: '#fff', fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamily.bold },
  loadingInfo: { alignItems: 'center', gap: Spacing.xs, paddingTop: Spacing.md },
  loadingText: { color: Colors.secondary, fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamily.medium },
  loadingSubtext: { color: Colors.textTertiary, fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.regular },
  resultContainer: { gap: Spacing.md },
  resultSummary: { borderRadius: BorderRadius.xl, padding: Spacing.base, gap: Spacing.sm, borderWidth: 1, borderColor: Colors.secondary + '33' },
  resultTitle: { color: Colors.textPrimary, fontSize: Typography.fontSize.xl, fontFamily: Typography.fontFamily.bold },
  resultDestination: { color: Colors.secondary, fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamily.medium },
  resultStats: { flexDirection: 'row', gap: Spacing.lg, flexWrap: 'wrap' },
  resultStat: { color: Colors.textSecondary, fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.medium },
  adviceCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  adviceEmoji: { fontSize: 20 },
  adviceText: { flex: 1, color: Colors.textSecondary, fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.regular, lineHeight: 18 },
  dayCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.md, gap: Spacing.sm, borderWidth: 1, borderColor: Colors.glassBorder },
  dayHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  dayBadge: { backgroundColor: Colors.primary, borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 3 },
  dayBadgeText: { color: '#fff', fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamily.bold },
  dayTitle: { color: Colors.textPrimary, fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamily.bold, flex: 1 },
  timelineItem: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' },
  timelineTime: { color: Colors.primary, fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamily.bold, width: 44, marginTop: 2 },
  timelineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary, marginTop: 6 },
  timelineContent: { flex: 1, gap: 2 },
  timelineActivity: { color: Colors.textPrimary, fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.medium },
  timelinePlace: { color: Colors.textSecondary, fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamily.regular },
  timelineCost: { color: Colors.accent, fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamily.medium },
  dayCost: { color: Colors.textSecondary, fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.medium, marginTop: Spacing.sm, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border },
  checklistCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.base, gap: Spacing.sm, borderWidth: 1, borderColor: Colors.glassBorder },
  checklistTitle: { color: Colors.textPrimary, fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamily.bold },
  checklistItem: { color: Colors.textSecondary, fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.regular },
  resultActions: { flexDirection: 'row', gap: Spacing.md },
  newPlanBtn: { flex: 1, paddingVertical: Spacing.base, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.glassBorder, alignItems: 'center' },
  newPlanBtnText: { color: Colors.textSecondary, fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.medium },
  savePlanBtn: { flex: 1, borderRadius: BorderRadius.lg, overflow: 'hidden' },
  savePlanBtnGradient: { paddingVertical: Spacing.base, alignItems: 'center' },
  savePlanBtnText: { color: '#fff', fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.bold },
});
