import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Phase 0 골격 — Phase 2에서 즐겨찾기 영역·전체 사이트 목록으로 대체 (docs/SITE_SYSTEM.md §7)
export default function HomeScreen() {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>{t('home.emptyTitle')}</Text>
        <Text style={styles.body}>{t('home.emptyBody')}</Text>
        <Text style={styles.notice}>{t('data.notice')}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 12 },
  title: { fontSize: 20, fontWeight: '600', textAlign: 'center' },
  body: { fontSize: 15, textAlign: 'center', opacity: 0.7 },
  notice: { fontSize: 12, textAlign: 'center', opacity: 0.45, marginTop: 16 },
});
