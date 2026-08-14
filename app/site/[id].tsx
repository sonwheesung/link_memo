import { Ionicons } from '@expo/vector-icons';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { SiteIcon } from '@/components/site-icon';
import { listAccounts, type Account } from '@/features/accounts/api';
import { deleteSite, getSite, setSiteFavorite, type Site } from '@/features/sites/api';
import { ensureFavicon } from '@/features/sites/favicon';
import { displayDomain } from '@/features/sites/url';
import { useTheme } from '@/theme/use-theme';

export default function SiteDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [site, setSite] = useState<Site | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      const loaded = getSite(id);
      setSite(loaded);
      setAccounts(listAccounts(id));
      if (loaded) ensureFavicon(loaded);
    }, [id]),
  );

  if (!site) return <Screen edges={[]}>{null}</Screen>;

  const toggleFavorite = () => {
    setSiteFavorite(site.id, !site.favorite);
    setSite(getSite(site.id));
  };

  const openInBrowser = () => {
    // 브라우저 실행 직전 광고 금지 (CLAUDE.md §7) — 여기엔 앞으로도 광고를 끼우지 않는다
    Linking.openURL(site.url).catch(() => {
      Alert.alert(t('site.openFailed'));
    });
  };

  const confirmDeleteSite = () => {
    Alert.alert(
      t('site.deleteTitle'),
      t('site.deleteBody', { name: site.name, count: accounts.length }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            deleteSite(site.id); // 계정은 FK CASCADE
            router.back();
          },
        },
      ],
    );
  };

  return (
    <Screen edges={[]}>
      <Stack.Screen
        options={{
          title: site.name,
          headerRight: () => (
            <View style={styles.headerRight}>
              <Pressable
                onPress={toggleFavorite}
                hitSlop={8}
                accessibilityLabel={t('common.favorites')}>
                <Ionicons
                  name={site.favorite ? 'heart' : 'heart-outline'}
                  size={21}
                  color={site.favorite ? theme.primary : theme.icon}
                />
              </Pressable>
              <Pressable
                onPress={() => router.push(`/site-add?id=${site.id}`)}
                hitSlop={8}
                accessibilityLabel={t('site.edit')}>
                <Ionicons name="pencil-outline" size={20} color={theme.icon} />
              </Pressable>
              <Pressable onPress={confirmDeleteSite} hitSlop={8} accessibilityLabel={t('common.delete')}>
                <Ionicons name="trash-outline" size={20} color={theme.icon} />
              </Pressable>
            </View>
          ),
        }}
      />
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.hero}>
          <SiteIcon name={site.name} favicon={site.favicon} size={64} />
          <Text style={[styles.name, { color: theme.text }]}>{site.name}</Text>
          <Text style={[styles.domain, { color: theme.textMuted }]}>{displayDomain(site.url)}</Text>
        </View>

        <Button
          label={t('site.openInBrowser')}
          onPress={openInBrowser}
          icon={<Ionicons name="open-outline" size={18} color={theme.buttonText} />}
        />

        <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
          {t('account.sectionTitle')}
        </Text>

        {accounts.map((account) => {
          const title = account.name ?? account.username ?? t('account.unnamed');
          return (
            <Pressable
              key={account.id}
              onPress={() => router.push({ pathname: '/account/[id]', params: { id: account.id } })}
              style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>{title}</Text>
              {account.username !== null ? (
                <View style={styles.fieldRow}>
                  <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>
                    {t('account.username')}
                  </Text>
                  <Text style={[styles.fieldValue, { color: theme.text }]}>{account.username}</Text>
                </View>
              ) : null}
              {account.memo !== null ? (
                account.memoSensitive ? (
                  // 카드에서는 상태 라벨만 — 내용 확인은 계정 상세에서 (2026-08-14 사용자 피드백)
                  <View style={styles.hiddenRow}>
                    <Ionicons name="lock-closed-outline" size={13} color={theme.textMuted} />
                    <Text style={[styles.hiddenLabel, { color: theme.textMuted }]}>
                      {t('account.hiddenMemo')}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.fieldRow}>
                    <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>
                      {t('account.memo')}
                    </Text>
                    <Text style={[styles.fieldValue, { color: theme.text }]} numberOfLines={2}>
                      {account.memo}
                    </Text>
                  </View>
                )
              ) : null}
            </Pressable>
          );
        })}

        <Pressable
          onPress={() => router.push(`/account-form?siteId=${site.id}`)}
          style={[styles.addAccount, { borderColor: theme.border }]}>
          <Ionicons name="add" size={18} color={theme.primary} />
          <Text style={[styles.addAccountLabel, { color: theme.primary }]}>{t('account.add')}</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRight: { flexDirection: 'row', gap: 18 },
  body: { padding: 20, gap: 14 },
  hero: { alignItems: 'center', gap: 6, marginBottom: 4 },
  avatar: { width: 64, height: 64, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 28, fontWeight: '700' },
  name: { fontSize: 22, fontWeight: '700', marginTop: 6 },
  domain: { fontSize: 14 },
  sectionTitle: { fontSize: 13, fontWeight: '600', marginTop: 10 },
  card: { borderWidth: 1, borderRadius: 14, padding: 14, gap: 10 },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  fieldRow: { gap: 2 },
  fieldLabel: { fontSize: 12 },
  fieldValue: { fontSize: 15, flexShrink: 1 },
  hiddenRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  hiddenLabel: { fontSize: 13, fontStyle: 'italic' },
  addAccount: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 13,
  },
  addAccountLabel: { fontSize: 15, fontWeight: '600' },
});
