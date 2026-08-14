import '@/lib/i18n';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import 'react-native-reanimated';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const { t } = useTranslation();

  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="site-add" options={{ presentation: 'modal', title: t('site.add') }} />
        <Stack.Screen name="search" options={{ title: t('common.search') }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
