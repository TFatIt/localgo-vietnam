import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMutation } from '@tanstack/react-query';
import { aiService } from '../services/places.service';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';
import { useAuthStore } from '../store/authStore';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const EXAMPLE_PROMPTS = [
  '🏔️ Lên kế hoạch 3 ngày ở Đà Lạt với 2 triệu đồng',
  '🏖️ Những quán cà phê ẩn mình đẹp nhất ở Đà Nẵng',
  '🌅 Xem bình minh đẹp nhất ở Phú Quốc',
  '🍜 Đặc sản nhất định phải thử ở Huế',
  '⛰️ Trekking Fansipan cho người mới bắt đầu',
  '💎 Hidden gem ở Quảng Nam ít người biết',
];

export default function AIChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Xin chào! Tôi là LocalGo AI, trợ lý du lịch Việt Nam của bạn 🇻🇳\n\nTôi có thể giúp bạn:\n• Lên kế hoạch chuyến đi\n• Tìm địa điểm đẹp\n• Gợi ý ẩm thực địa phương\n• Tư vấn lịch trình phù hợp\n\nHỏi tôi bất cứ điều gì về du lịch Việt Nam!',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const { user } = useAuthStore();

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: content.trim(), timestamp: new Date() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const apiMessages = newMessages.map((m) => ({ role: m.role, content: m.content }));
      const res = await aiService.chat(apiMessages);
      const reply = res.data?.reply || 'Xin lỗi, tôi không thể xử lý yêu cầu này.';

      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
      }]);
    } catch {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'Xin lỗi, đã xảy ra lỗi. Vui lòng thử lại sau.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageRow, isUser && styles.messageRowUser]}>
        {!isUser && (
          <View style={styles.botAvatar}>
            <Text style={{ fontSize: 18 }}>🤖</Text>
          </View>
        )}
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.botBubble]}>
          <Text style={[styles.messageText, isUser && styles.userMessageText]}>
            {item.content}
          </Text>
          <Text style={styles.messageTime}>
            {item.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        {isUser && (
          <View style={styles.userAvatar}>
            <Text style={{ fontSize: 16 }}>👤</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <StatusBar style="light" />

      {/* Header */}
      <LinearGradient colors={['#0D1B2E', '#0A0E1A']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerAvatar}>
            <Text style={{ fontSize: 22 }}>🤖</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>LocalGo AI</Text>
            <Text style={styles.headerSubtitle}>Trợ lý du lịch thông minh</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => setMessages([{
            role: 'assistant',
            content: 'Cuộc trò chuyện mới bắt đầu! Hỏi tôi về du lịch Việt Nam nhé 🇻🇳',
            timestamp: new Date(),
          }])}
        >
          <Text style={styles.clearBtn}>🗑️</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        ListFooterComponent={
          isLoading ? (
            <View style={[styles.messageRow]}>
              <View style={styles.botAvatar}><Text style={{ fontSize: 18 }}>🤖</Text></View>
              <View style={[styles.messageBubble, styles.botBubble, styles.typingBubble]}>
                <ActivityIndicator size="small" color={Colors.secondary} />
                <Text style={styles.typingText}>Đang nghĩ...</Text>
              </View>
            </View>
          ) : null
        }
      />

      {/* Example prompts (shown only when 1 message) */}
      {messages.length === 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.promptsRow}
          style={styles.promptsContainer}
        >
          {EXAMPLE_PROMPTS.map((prompt, i) => (
            <TouchableOpacity
              key={i}
              style={styles.promptChip}
              onPress={() => sendMessage(prompt)}
            >
              <Text style={styles.promptText}>{prompt}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Input */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Hỏi về du lịch Việt Nam..."
            placeholderTextColor={Colors.textTertiary}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || isLoading) && styles.sendBtnDisabled]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
          >
            <LinearGradient
              colors={input.trim() && !isLoading ? [Colors.primary, Colors.primaryDark] : [Colors.surface, Colors.surface]}
              style={styles.sendBtnGradient}
            >
              <Text style={{ fontSize: 18 }}>↑</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        <Text style={styles.inputHint}>Powered by OpenAI GPT-4o</Text>
      </View>
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
  backBtn: { padding: Spacing.sm },
  backBtnText: { color: Colors.textPrimary, fontSize: 22 },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.secondary,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.bold,
  },
  headerSubtitle: {
    color: Colors.secondary,
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
  },
  clearBtn: { fontSize: 20, padding: Spacing.sm },
  messagesList: {
    padding: Spacing.base,
    gap: Spacing.md,
    flexGrow: 1,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  messageRowUser: { justifyContent: 'flex-end' },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    gap: 4,
  },
  botBubble: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  userBubble: {
    backgroundColor: Colors.primary,
    borderTopRightRadius: 4,
  },
  typingBubble: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  typingText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
  },
  messageText: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    lineHeight: 22,
  },
  userMessageText: { color: '#FFFFFF' },
  messageTime: {
    color: Colors.textMuted,
    fontSize: 10,
    fontFamily: Typography.fontFamily.regular,
    alignSelf: 'flex-end',
  },
  promptsContainer: {
    maxHeight: 52,
    marginBottom: Spacing.sm,
  },
  promptsRow: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
  },
  promptChip: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  promptText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
  },
  inputContainer: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Platform.OS === 'ios' ? 32 : Spacing.md,
    paddingTop: Spacing.sm,
    backgroundColor: Colors.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm + 2,
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  sendBtn: { borderRadius: BorderRadius.full, overflow: 'hidden' },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnGradient: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputHint: {
    textAlign: 'center',
    color: Colors.textMuted,
    fontSize: 10,
    fontFamily: Typography.fontFamily.regular,
  },
});
