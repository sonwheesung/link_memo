import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Phase 0 골격 — Phase 2에서 즐겨찾기 영역·전체 사이트 목록으로 대체 (docs/SITE_SYSTEM.md §7)
export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.brand}>LinkMemo</Text>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => router.push('/search')}
            hitSlop={8}
            accessibilityLabel={t('common.search')}>
            <Ionicons name="search-outline" size={24} />
          </Pressable>
          <Pressable
            onPress={() => router.push('/site-add')}
            hitSlop={8}
            accessibilityLabel={t('site.add')}>
            <Ionicons name="add" size={28} />
          </Pressable>
        </View>
      </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  brand: { fontSize: 22, fontWeight: '700' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 12 },
  title: { fontSize: 20, fontWeight: '600', textAlign: 'center' },
  body: { fontSize: 15, textAlign: 'center', opacity: 0.7 },
  notice: { fontSize: 12, textAlign: 'center', opacity: 0.45, marginTop: 16 },
});
