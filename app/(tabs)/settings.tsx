import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { useThemeStore } from '@/theme/store';
import { useTheme } from '@/theme/use-theme';

// Phase 0 골격 — Remove Ads(7)·Data·App Information 행이 단계별로 들어온다
export default function SettingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const themeId = useThemeStore((s) => s.themeId);

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.text }]}>{t('settings.title')}</Text>
        <Pressable
          onPress={() => router.push('/theme')}
          style={[styles.row, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.rowLabel, { color: theme.text }]}>{t('settings.theme')}</Text>
          <View style={styles.rowRight}>
            <Text style={[styles.rowValue, { color: theme.textMuted }]}>
              {t(`theme.names.${themeId}`)}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
          </View>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 16 },
  title: { fontSize: 24, fontWeight: '700' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowLabel: { fontSize: 16, fontWeight: '500' },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowValue: { fontSize: 14 },
});
