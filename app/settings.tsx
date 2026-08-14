import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { useUnreadNoticeCount } from '@/features/support/store';
import { LANGUAGE_LABELS } from '@/lib/i18n';
import { useLanguageStore } from '@/lib/language';
import { useThemeStore } from '@/theme/store';
import { useTheme } from '@/theme/use-theme';

// 스택 화면 — 홈 우상단 ⚙로 진입. Remove Ads(7)·Data·App Information 행이 단계별로 들어온다
export default function SettingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const themeId = useThemeStore((s) => s.themeId);
  const languageOverride = useLanguageStore((s) => s.override);
  const unreadNotices = useUnreadNoticeCount();

  const rows = [
    {
      key: 'theme',
      label: t('settings.theme'),
      value: t(`theme.names.${themeId}`),
      onPress: () => router.push('/theme'),
    },
    {
      key: 'language',
      label: t('settings.language'),
      value: languageOverride ? LANGUAGE_LABELS[languageOverride] : t('language.system'),
      onPress: () => router.push('/language'),
    },
    {
      key: 'notice',
      label: t('settings.notice'),
      value: '',
      badge: unreadNotices > 0, // 푸시가 없어 이 점이 통지의 전부다 (조각 승계)
      onPress: () => router.push('/notice'),
    },
    {
      key: 'inquiry',
      label: t('settings.inquiry'),
      value: '',
      onPress: () => router.push('/inquiry'),
    },
    {
      key: 'inquiries',
      label: t('inquiry.historyTitle'),
      value: '',
      onPress: () => router.push('/inquiries'),
    },
  ];

  return (
    <Screen edges={[]}>
      <View style={styles.container}>
        {rows.map((row) => (
          <Pressable
            key={row.key}
            onPress={row.onPress}
            style={[styles.row, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.rowLeft}>
              <Text style={[styles.rowLabel, { color: theme.text }]}>{row.label}</Text>
              {'badge' in row && row.badge ? (
                <View style={[styles.dot, { backgroundColor: theme.primary }]} />
              ) : null}
            </View>
            <View style={styles.rowRight}>
              <Text style={[styles.rowValue, { color: theme.textMuted }]}>{row.value}</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
            </View>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  rowLabel: { fontSize: 16, fontWeight: '500' },
  dot: { width: 7, height: 7, borderRadius: 4 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowValue: { fontSize: 14 },
});
