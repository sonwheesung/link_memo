import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

// Phase 0 골격 — Phase 2에서 URL 입력·이름 자동 제안 폼으로 대체 (docs/SITE_SYSTEM.md §2)
export default function SiteAddScreen() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('site.add')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 18, fontWeight: '600' },
});
