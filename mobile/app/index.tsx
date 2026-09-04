import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/authStore';

export default function Index() {
  const { isAuthenticated, isGuest, isOnboardingComplete } = useAuthStore();

  if (!isOnboardingComplete) {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (isAuthenticated || isGuest) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
