import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AdBanner } from '@/components/ad-banner';
import { Screen } from '@/components/screen';
import { SiteIcon } from '@/components/site-icon';
import { ensureFavicon } from '@/features/sites/favicon';
import { listSites, type SiteWithCount } from '@/features/sites/api';
import { displayDomain } from '@/features/sites/url';
import { useTheme } from '@/theme/use-theme';

// 단일 화면 구조 — 홈이 유일한 메인 화면, 우상단 [검색][추가][설정]이 입구 전부 (docs/SITE_SYSTEM.md §7)
export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const [sites, setSites] = useState<SiteWithCount[]>([]);

  useFocusEffect(
    useCallback(() => {
      const loaded = listSites();
      setSites(loaded);
      // 아이콘 미해석 사이트는 백그라운드로 해석 시도 (세션당 1회)
      loaded.forEach(ensureFavicon);
    }, []),
  );

  const favorites = sites.filter((s) => s.favorite);
  const openSite = (id: string) => router.push({ pathname: '/site/[id]', params: { id } });

  return (
    <Screen edges={['top', 'bottom']} footer={<AdBanner />}>
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

      {sites.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>{t('home.emptyTitle')}</Text>
          <Text style={[styles.emptyBody, { color: theme.textMuted }]}>{t('home.emptyBody')}</Text>
          <Text style={[styles.notice, { color: theme.textMuted }]}>{t('data.notice')}</Text>
        </View>
      ) : (
        <FlatList
          data={sites}
          keyExtractor={(s) => s.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View>
              {favorites.length > 0 ? (
                <View style={styles.favoritesBlock}>
                  <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
                    {t('common.favorites')}
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.favoritesRow}>
                      {favorites.map((site) => (
                        <Pressable
                          key={site.id}
                          onPress={() => openSite(site.id)}
                          style={[
                            styles.favoriteCard,
                            { backgroundColor: theme.favoriteArea, borderColor: theme.border },
                          ]}>
                          <SiteIcon name={site.name} favicon={site.favicon} size={34} />
                          <Text
                            numberOfLines={1}
                            style={[styles.favoriteName, { color: theme.text }]}>
                            {site.name}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              ) : null}
              <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
                {t('site.allSites')}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => openSite(item.id)}
              style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <SiteIcon name={item.name} favicon={item.favicon} size={40} />
              <View style={styles.cardBody}>
                <Text numberOfLines={1} style={[styles.cardName, { color: theme.text }]}>
                  {item.name}
                </Text>
                <Text numberOfLines={1} style={[styles.cardUrl, { color: theme.textMuted }]}>
                  {displayDomain(item.url)}
                </Text>
              </View>
              {item.accountCount > 0 ? (
                <View style={[styles.badge, { backgroundColor: theme.badge }]}>
                  <Text style={[styles.badgeText, { color: theme.badgeText }]}>{item.accountCount}</Text>
                </View>
              ) : null}
              {item.favorite ? (
                <Ionicons name="heart" size={14} color={theme.primary} />
              ) : null}
            </Pressable>
          )}
        />
      )}
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
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '600', textAlign: 'center' },
  emptyBody: { fontSize: 15, textAlign: 'center' },
  notice: { fontSize: 12, textAlign: 'center', opacity: 0.7, marginTop: 16 },
  list: { paddingHorizontal: 16, paddingBottom: 12, gap: 10 },
  sectionTitle: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 4 },
  favoritesBlock: { marginBottom: 8 },
  favoritesRow: { flexDirection: 'row', gap: 10 },
  favoriteCard: {
    width: 96,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  favoriteName: { fontSize: 12, fontWeight: '600', maxWidth: 80 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  cardBody: { flex: 1, gap: 2 },
  cardName: { fontSize: 16, fontWeight: '600' },
  cardUrl: { fontSize: 13 },
  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 7,
  },
  badgeText: { fontSize: 12, fontWeight: '600' },
});
