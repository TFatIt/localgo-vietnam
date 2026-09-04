import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  _id: string;
  firebaseUid: string;
  email: string;
  displayName: string;
  avatar?: string;
  phone?: string;
  gender?: string;
  birthday?: string;
  bio?: string;
  role: 'user' | 'admin' | 'business';
  travelInterests: string[];
  points: number;
  xp: number;
  level: number;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  visitedProvincesCount: number;
  language: 'vi' | 'en';
  theme: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
  badges: Array<{ _id: string; name: string; icon: string; color: string; rarity: string }>;
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isOnboardingComplete: boolean;
  setUser: (user: UserProfile) => void;
  setToken: (token: string) => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  setOnboardingComplete: () => void;
  setGuest: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isGuest: false,
      isOnboardingComplete: false,

      setUser: (user) => set({ user, isAuthenticated: true, isGuest: false }),
      setToken: (token) => set({ token }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
      setOnboardingComplete: () => set({ isOnboardingComplete: true }),
      setGuest: () => set({ isGuest: true, isAuthenticated: false }),
      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isGuest: false,
        }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isOnboardingComplete: state.isOnboardingComplete,
        isGuest: state.isGuest,
      }),
    },
  ),
);
