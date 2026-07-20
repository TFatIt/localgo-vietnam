import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

type Theme = 'light' | 'dark' | 'system';
type Language = 'vi' | 'en';

interface AppState {
  theme: Theme;
  language: Language;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  resolveTheme: (systemTheme: 'light' | 'dark' | null | undefined) => 'light' | 'dark';
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      language: 'vi',
      isDark: true,

      setTheme: (theme) => {
        set({ theme });
      },

      setLanguage: (language) => set({ language }),

      resolveTheme: (systemTheme) => {
        const { theme } = get();
        if (theme === 'system') return systemTheme === 'light' ? 'light' : 'dark';
        return theme;
      },
    }),
    {
      name: 'app-settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

// Hook to get the current resolved theme
export const useTheme = () => {
  const { theme, resolveTheme } = useAppStore();
  const systemTheme = useColorScheme();
  const resolved = resolveTheme(systemTheme);
  return { theme, resolvedTheme: resolved, isDark: resolved === 'dark' };
};
