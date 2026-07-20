import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Colors, Typography } from '../../constants/theme';
import { useTheme } from '../../store/appStore';

interface TabIconProps {
  emoji: string;
  label: string;
  focused: boolean;
  color: string;
}

const TabIcon = ({ emoji, label, focused, color }: TabIconProps) => (
  <View style={styles.tabItem}>
    <Text style={[styles.tabEmoji, focused && { transform: [{ scale: 1.1 }] }]}>{emoji}</Text>
    <Text style={[styles.tabLabel, { color, fontSize: focused ? 10 : 9 }]}>{label}</Text>
  </View>
);

export default function TabsLayout() {
  const { isDark } = useTheme();

  const backgroundColor = isDark ? Colors.backgroundSecondary : '#FFFFFF';
  const borderColor = isDark ? Colors.border : 'rgba(0,0,0,0.08)';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor,
          borderTopColor: borderColor,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
          ...{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 20,
          },
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: isDark ? Colors.textTertiary : '#9CA3AF',
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="🏠" label="Trang chủ" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="🔍" label="Tìm kiếm" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View style={[styles.mapTabContainer, focused && styles.mapTabActive]}>
              <Text style={styles.mapTabEmoji}>🗺️</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="📸" label="Cộng đồng" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="👤" label="Hồ sơ" focused={focused} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabItem: { alignItems: 'center', gap: 2 },
  tabEmoji: { fontSize: 22 },
  tabLabel: {
    fontFamily: Typography.fontFamily.medium,
    letterSpacing: 0.2,
  },
  mapTabContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -16,
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  mapTabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  mapTabEmoji: { fontSize: 24 },
});
