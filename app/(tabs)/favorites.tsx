import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { useTheme } from '@/theme/use-theme';

// Phase 0 골격 — Phase 3에서 즐겨찾기 목록으로 대체
export default function FavoritesScreen() {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={[styles.empty, { color: theme.textMuted }]}>{t('favorites.empty')}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  empty: { fontSize: 15 },
});
