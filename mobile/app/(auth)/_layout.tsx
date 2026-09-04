import { Stack } from 'expo-router';

/**
 * Layout cho nhóm route xác thực (auth).
 * Bao gồm: welcome, login, email-login
 */
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="email-login" />
    </Stack>
  );
}
