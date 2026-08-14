import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, Pressable, Text, TextInput, View } from 'react-native';

import { Screen } from '@/components/screen';
import { SiteIcon } from '@/components/site-icon';
import { searchSites, type MatchField, type SearchResult } from '@/features/sites/search';
import { displayDomain } from '@/features/sites/url';
import { useTheme } from '@/theme/use-theme';

// 검색 — 대상 5필드, 250ms 디바운스, 민감 메모 미리보기 마스킹 (docs/SITE_SYSTEM.md §5)
export default function SearchScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setResults(searchSites(query)), 250);
    return () => clearTimeout(timer);
  }, [query]);

  const fieldLabel = (field: MatchField): string => {
    switch (field) {
      case 'accountName':
        return t('account.name');
      case 'username':
        return t('account.username');
      case 'memo':
        return t('account.memo');
      default:
        return '';
    }
  };

  return (
    <Screen edges={[]}>
      <View style={styles.searchBarWrap}>
        <View
          style={[styles.searchBar, { backgroundColor: theme.searchBar, borderColor: theme.border }]}>
          <Ionicons name="search-outline" size={18} color={theme.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('search.placeholder')}
            placeholderTextColor={theme.textMuted}
            style={[styles.input, { color: theme.text }]}
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 ? (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={theme.textMuted} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {query.trim().length > 0 && results.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={[styles.empty, { color: theme.textMuted }]}>{t('search.noResults')}</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(r) => r.site.id}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push({ pathname: '/site/[id]', params: { id: item.site.id } })}
              style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <SiteIcon name={item.site.name} favicon={item.site.favicon} size={36} />
              <View style={styles.cardBody}>
                <Text numberOfLines={1} style={[styles.cardName, { color: theme.text }]}>
                  {item.site.name}
                </Text>
                <Text numberOfLines={1} style={[styles.cardUrl, { color: theme.textMuted }]}>
                  {displayDomain(item.site.url)}
                </Text>
                {item.matchField !== 'siteName' && item.matchField !== 'url' ? (
                  <Text numberOfLines={1} style={[styles.hint, { color: theme.textMuted }]}>
                    {item.matchText !== null
                      ? `${fieldLabel(item.matchField)} · ${item.matchText}`
                      : `🔒 ${t('account.hiddenMemo')}`}
                  </Text>
                ) : null}
              </View>
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchBarWrap: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  input: { flex: 1, fontSize: 16, paddingVertical: 10 },
  emptyWrap: { flex: 1, alignItems: 'center', paddingTop: 48 },
  empty: { fontSize: 14 },
  list: { padding: 16, gap: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
  },
  cardBody: { flex: 1, gap: 2 },
  cardName: { fontSize: 15, fontWeight: '600' },
  cardUrl: { fontSize: 12 },
  hint: { fontSize: 12, fontStyle: 'italic' },
});
