import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

// Phase 0 골격 — Phase 3에서 검색 입력·결과 목록으로 대체 (docs/SITE_SYSTEM.md §5)
export default function SearchScreen() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('common.search')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 18, fontWeight: '600' },
});
