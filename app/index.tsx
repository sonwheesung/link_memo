import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AdBannerPlaceholder } from '@/components/ad-banner-placeholder';
import { Screen } from '@/components/screen';
import { useTheme } from '@/theme/use-theme';

// 단일 화면 구조 — 홈이 유일한 메인 화면, 우상단 [검색][추가][설정]이 입구 전부 (docs/SITE_SYSTEM.md §7)
// Phase 2에서 즐겨찾기 섹션·전체 사이트 목록이 본문에 들어온다.
export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();

  return (
    <Screen edges={['top', 'bottom']} footer={<AdBannerPlaceholder />}>
      <View style={styles.header}>
        <Text style={[styles.brand, { color: theme.text }]}>LinkMemo</Text>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => router.push('/search')}
            hitSlop={8}
            accessibilityLabel={t('common.search')}>
            <Ionicons name="search-outline" size={24} color={theme.icon} />
          </Pressable>
          <Pressable
            onPress={() => router.push('/site-add')}
            hitSlop={8}
            accessibilityLabel={t('site.add')}>
            <Ionicons name="add" size={28} color={theme.icon} />
          </Pressable>
          <Pressable
            onPress={() => router.push('/settings')}
            hitSlop={8}
            accessibilityLabel={t('common.settings')}>
            <Ionicons name="settings-outline" size={23} color={theme.icon} />
          </Pressable>
        </View>
      </View>
      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.text }]}>{t('home.emptyTitle')}</Text>
        <Text style={[styles.body, { color: theme.textMuted }]}>{t('home.emptyBody')}</Text>
        <Text style={[styles.notice, { color: theme.textMuted }]}>{t('data.notice')}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  brand: { fontSize: 22, fontWeight: '700' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 12 },
  title: { fontSize: 20, fontWeight: '600', textAlign: 'center' },
  body: { fontSize: 15, textAlign: 'center' },
  notice: { fontSize: 12, textAlign: 'center', opacity: 0.7, marginTop: 16 },
});
