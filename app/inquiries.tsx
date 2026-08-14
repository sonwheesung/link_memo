import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { commonServer, ensureDeviceSession } from '@/features/support/server';
import type { MyInquiry } from '@/lib/common-server';
import { useTheme } from '@/theme/use-theme';

// 문의 내역 — 기기 토큰으로 귀속된 내 문의의 상태·답변을 보여준다 (ARCHITECTURE §4)
export default function InquiriesScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const [inquiries, setInquiries] = useState<MyInquiry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      void (async () => {
        await ensureDeviceSession();
        const r = await commonServer.fetchMyInquiries();
        if (!cancelled) {
          if (r.ok) setInquiries(r.inquiries);
          setLoaded(true);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const statusColor = (status: MyInquiry['status']) =>
    status === 'replied' ? theme.primary : status === 'resolved' ? theme.textMuted : theme.badgeText;

  return (
    <Screen edges={[]}>
      {loaded && inquiries.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={[styles.empty, { color: theme.textMuted }]}>{t('inquiry.historyEmpty')}</Text>
        </View>
      ) : (
        <FlatList
          data={inquiries}
          keyExtractor={(q) => q.id}
          contentContainerStyle={styles.list}
          ListFooterComponent={
            inquiries.length > 0 ? (
              <Text style={[styles.note, { color: theme.textMuted }]}>{t('inquiry.historyNote')}</Text>
            ) : null
          }
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.category, { color: theme.textMuted }]}>
                  {t(`inquiry.categories.${item.category}`)}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: theme.badge }]}>
                  <Text style={[styles.statusText, { color: statusColor(item.status) }]}>
                    {t(`inquiry.status.${item.status}`)}
                  </Text>
                </View>
              </View>
              <Text style={[styles.content, { color: theme.text }]}>{item.content}</Text>
              <Text style={[styles.date, { color: theme.textMuted }]}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
              {item.reply ? (
                <View style={[styles.replyBox, { backgroundColor: theme.selected }]}>
                  <Text style={[styles.replyLabel, { color: theme.primary }]}>
                    {t('inquiry.replyLabel')}
                  </Text>
                  <Text style={[styles.replyText, { color: theme.text }]}>{item.reply}</Text>
                </View>
              ) : null}
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
  note: { fontSize: 12, lineHeight: 18, marginTop: 6 },
  card: { borderWidth: 1, borderRadius: 14, padding: 14, gap: 8 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  category: { fontSize: 12, fontWeight: '600' },
  statusBadge: { borderRadius: 10, paddingHorizontal: 9, paddingVertical: 3 },
  statusText: { fontSize: 11, fontWeight: '700' },
  content: { fontSize: 14, lineHeight: 21 },
  date: { fontSize: 12, opacity: 0.8 },
  replyBox: { borderRadius: 10, padding: 12, gap: 4, marginTop: 2 },
  replyLabel: { fontSize: 12, fontWeight: '700' },
  replyText: { fontSize: 14, lineHeight: 21 },
});
