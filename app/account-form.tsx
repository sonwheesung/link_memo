import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { TextField } from '@/components/text-field';
import { createAccount, deleteAccount, getAccount, updateAccount } from '@/features/accounts/api';
import { useTheme } from '@/theme/use-theme';

// 계정 추가 + 수정 겸용 (/account-form?siteId=&id=). 전 필드 선택 — CLAUDE.md §5
export default function AccountFormScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const { siteId, id } = useLocalSearchParams<{ siteId: string; id?: string }>();
  const editing = useMemo(() => (id ? getAccount(id) : null), [id]);

  const [name, setName] = useState(editing?.name ?? '');
  const [username, setUsername] = useState(editing?.username ?? '');
  const [memo, setMemo] = useState(editing?.memo ?? '');
  const [sensitive, setSensitive] = useState(editing?.memoSensitive ?? false);

  const save = () => {
    const input = { name, username, memo, memoSensitive: sensitive };
    if (editing) {
      updateAccount(editing.id, input);
    } else if (siteId) {
      createAccount(siteId, input);
    }
    router.back();
  };

  const confirmDelete = () => {
    if (!editing) return;
    Alert.alert(t('account.deleteTitle'), t('account.deleteBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => {
          deleteAccount(editing.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ title: editing ? t('account.edit') : t('account.add') }} />
      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <TextField label={t('account.name')} value={name} onChangeText={setName} autoFocus={!editing} />
        <TextField
          label={t('account.username')}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextField label={t('account.memo')} value={memo} onChangeText={setMemo} multiline />
        <View style={styles.switchRow}>
          <Text style={[styles.switchLabel, { color: theme.text }]}>{t('account.sensitive')}</Text>
          <Switch
            value={sensitive}
            onValueChange={setSensitive}
            trackColor={{ true: theme.primary }}
          />
        </View>
        <Button label={t('common.save')} onPress={save} />
        {editing ? (
          <Pressable onPress={confirmDelete} style={styles.deleteButton}>
            <Text style={styles.deleteLabel}>{t('account.deleteTitle')}</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { padding: 20, gap: 16 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  switchLabel: { fontSize: 15, flex: 1, marginRight: 12 },
  deleteButton: { alignItems: 'center', paddingVertical: 10 },
  deleteLabel: { fontSize: 15, fontWeight: '500', color: '#DC2626' },
});
