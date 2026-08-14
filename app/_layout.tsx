import '@/lib/i18n';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import 'react-native-reanimated';

import { useTheme } from '@/theme/use-theme';

export default function RootLayout() {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.surface },
          headerTintColor: theme.text,
          contentStyle: { backgroundColor: theme.background },
        }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="site-add" options={{ presentation: 'modal', title: t('site.add') }} />
        <Stack.Screen name="search" options={{ title: t('common.search') }} />
        <Stack.Screen name="settings" options={{ title: t('common.settings') }} />
        <Stack.Screen name="theme" options={{ title: t('settings.theme') }} />
      </Stack>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
    </>
  );
}
