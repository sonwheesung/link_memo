import '@/lib/i18n';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import 'react-native-reanimated';

import { BootGate } from '@/components/boot-gate';
import { useTheme } from '@/theme/use-theme';

export default function RootLayout() {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <BootGate>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.surface },
          headerTintColor: theme.text,
          contentStyle: { backgroundColor: theme.background },
        }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="site-add" options={{ presentation: 'modal' }} />
        <Stack.Screen name="site/[id]" options={{ title: '' }} />
        <Stack.Screen name="account/[id]" options={{ title: '' }} />
        <Stack.Screen name="account-form" options={{ presentation: 'modal' }} />
        <Stack.Screen name="search" options={{ title: t('common.search') }} />
        <Stack.Screen name="settings" options={{ title: t('common.settings') }} />
        <Stack.Screen name="theme" options={{ title: t('settings.theme') }} />
        <Stack.Screen name="language" options={{ title: t('settings.language') }} />
        <Stack.Screen name="notice" options={{ title: t('settings.notice') }} />
        <Stack.Screen name="inquiry" options={{ title: t('settings.inquiry') }} />
        <Stack.Screen name="inquiries" options={{ title: t('inquiry.historyTitle') }} />
      </Stack>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
    </BootGate>
  );
}
