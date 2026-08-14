import { Ionicons } from '@expo/vector-icons';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { deleteAccount, getAccount, type Account } from '@/features/accounts/api';
import { useTheme } from '@/theme/use-theme';

// 계정 상세(보기) — 민감한 메모는 여기서만 눈 아이콘으로 확인한다 (docs/SITE_SYSTEM.md §3, 2026-08-14)
export default function AccountDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [account, setAccount] = useState<Account | null>(null);
  const [revealed, setRevealed] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      setAccount(getAccount(id));
      setRevealed(false); // 화면에 돌아올 때마다 다시 가린다
    }, [id]),
  );

  if (!account) return <Screen edges={[]}>{null}</Screen>;

  const title = account.name ?? account.username ?? t('account.unnamed');
  const hidden = account.memoSensitive && !revealed;

  const confirmDelete = () => {
    Alert.alert(t('account.deleteTitle'), t('account.deleteBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => {
          deleteAccount(account.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <Screen edges={[]}>
      <Stack.Screen
        options={{
          title,
          headerRight: () => (
            <View style={styles.headerRight}>
              <Pressable
                onPress={() =>
                  router.push(`/account-form?siteId=${account.siteId}&id=${account.id}`)
                }
                hitSlop={8}
                accessibilityLabel={t('account.edit')}>
                <Ionicons name="pencil-outline" size={20} color={theme.icon} />
              </Pressable>
              <Pressable onPress={confirmDelete} hitSlop={8} accessibilityLabel={t('common.delete')}>
                <Ionicons name="trash-outline" size={20} color={theme.icon} />
              </Pressable>
            </View>
          ),
        }}
      />
      <ScrollView contentContainerStyle={styles.body}>
        {account.name !== null ? (
          <Field label={t('account.name')} value={account.name} />
        ) : null}
        {account.username !== null ? (
          <Field label={t('account.username')} value={account.username} />
        ) : null}
        {account.memo !== null ? (
          <View style={[styles.field, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.memoHeader}>
              <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>
                {account.memoSensitive ? `🔒 ${t('account.memo')}` : t('account.memo')}
              </Text>
              {account.memoSensitive ? (
                <Pressable
                  onPress={() => setRevealed((r) => !r)}
                  hitSlop={8}
                  accessibilityLabel={t('account.toggleMemo')}>
                  <Ionicons
                    name={hidden ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color={theme.icon}
                  />
                </Pressable>
              ) : null}
            </View>
            {hidden ? (
              <Text style={[styles.hiddenLabel, { color: theme.textMuted }]}>
                {t('account.hiddenMemo')}
              </Text>
            ) : (
              <Text style={[styles.fieldValue, { color: theme.text }]}>{account.memo}</Text>
            )}
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.field, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>{label}</Text>
      <Text style={[styles.fieldValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRight: { flexDirection: 'row', gap: 18 },
  body: { padding: 20, gap: 12 },
  field: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 6 },
  fieldLabel: { fontSize: 12, fontWeight: '500' },
  fieldValue: { fontSize: 16 },
  memoHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hiddenLabel: { fontSize: 15, fontStyle: 'italic' },
});
