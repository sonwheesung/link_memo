import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { useTheme } from '@/theme/use-theme';

// Phase 0 골격 — Phase 3에서 검색 입력·결과 목록으로 대체 (docs/SITE_SYSTEM.md §5)
export default function SearchScreen() {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Screen edges={[]}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.text }]}>{t('common.search')}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 18, fontWeight: '600' },
});
