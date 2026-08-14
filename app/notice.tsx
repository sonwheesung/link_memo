import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { useBootStore, useNoticeReadStore } from '@/features/support/store';
import { useTheme } from '@/theme/use-theme';

// 공지 — bootstrap 응답의 announcements를 보여준다. 읽음 처리는 로컬 (features/support/store.ts)
export default function NoticeScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const boot = useBootStore((s) => s.boot);
  const markRead = useNoticeReadStore((s) => s.markRead);
  const announcements = useMemo(() => boot?.announcements ?? [], [boot]);

  useFocusEffect(
    useCallback(() => {
      if (announcements.length > 0) markRead(announcements.map((a) => a.id));
    }, [announcements, markRead]),
  );

  return (
    <Screen edges={[]}>
      {announcements.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={[styles.empty, { color: theme.textMuted }]}>{t('notice.empty')}</Text>
        </View>
      ) : (
        <FlatList
          data={announcements}
          keyExtractor={(a) => a.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.cardHeader}>
                {item.pinned ? <Text style={[styles.pin, { color: theme.primary }]}>📌</Text> : null}
                <Text style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text>
              </View>
              <Text style={[styles.cardBody, { color: theme.textMuted }]}>{item.body}</Text>
              <Text style={[styles.cardDate, { color: theme.textMuted }]}>
                {new Date(item.startsAt).toLocaleDateString()}
              </Text>
            </View>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  emptyWrap: { flex: 1, alignItems: 'center', paddingTop: 48 },
  empty: { fontSize: 14 },
  list: { padding: 16, gap: 10 },
  card: { borderWidth: 1, borderRadius: 14, padding: 14, gap: 8 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pin: { fontSize: 13 },
  cardTitle: { fontSize: 16, fontWeight: '600', flexShrink: 1 },
  cardBody: { fontSize: 14, lineHeight: 21 },
  cardDate: { fontSize: 12, opacity: 0.8 },
});
