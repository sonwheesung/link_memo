import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { TextField } from '@/components/text-field';
import { commonServer, ensureDeviceSession } from '@/features/support/server';
import { CONTENT_MAX, CONTENT_MIN, type SupportCategory } from '@/lib/common-server';
import { useTheme } from '@/theme/use-theme';

const CATEGORIES: SupportCategory[] = ['bug', 'suggestion', 'question', 'etc'];

// 문의 — 익명 단방향(로그인 없음). 서버로 나가는 유일한 사용자 입력 (ARCHITECTURE §1)
export default function InquiryScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const [category, setCategory] = useState<SupportCategory>('bug');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);

  const send = async () => {
    setSending(true);
    // 기기 세션을 먼저 확보해 문의를 귀속시킨다 — 실패해도 익명으로 전송은 된다(내역에만 안 남는다)
    await ensureDeviceSession();
    const r = await commonServer.sendInquiry(category, content);
    setSending(false);
    if (r.ok) {
      Alert.alert(t('inquiry.sentTitle'), t('inquiry.sentBody'), [
        { text: t('common.ok'), onPress: () => router.back() },
      ]);
      return;
    }
    // 실패해도 본문을 지우지 않는다 — 재시도할 수 있게 (SDK 규약)
    const message =
      r.reason === 'too-short'
        ? t('inquiry.tooShort', { min: CONTENT_MIN })
        : r.reason === 'rate-limited'
          ? t('inquiry.rateLimited')
          : r.reason === 'offline'
            ? t('inquiry.offline')
            : t('inquiry.failed');
    Alert.alert(t('inquiry.failedTitle'), message);
  };

  return (
    <Screen edges={[]}>
      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <Text style={[styles.label, { color: theme.textMuted }]}>{t('inquiry.category')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Pressable style={styles.chips}>
            {CATEGORIES.map((c) => {
              const selected = c === category;
              return (
                <Pressable
                  key={c}
                  onPress={() => setCategory(c)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: selected ? theme.selected : theme.card,
                      borderColor: selected ? theme.primary : theme.border,
                    },
                  ]}>
                  <Text style={[styles.chipLabel, { color: selected ? theme.primary : theme.text }]}>
                    {t(`inquiry.categories.${c}`)}
                  </Text>
                </Pressable>
              );
            })}
          </Pressable>
        </ScrollView>
        <TextField
          label={t('inquiry.content')}
          value={content}
          onChangeText={setContent}
          placeholder={t('inquiry.placeholder')}
          multiline
          maxLength={CONTENT_MAX}
        />
        <Button
          label={t('inquiry.send')}
          onPress={() => void send()}
          disabled={sending || content.trim().length < CONTENT_MIN}
        />
        <Text style={[styles.privacy, { color: theme.textMuted }]}>{t('inquiry.privacyNote')}</Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { padding: 20, gap: 14 },
  label: { fontSize: 13, fontWeight: '500' },
  chips: { flexDirection: 'row', gap: 8 },
  chip: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  chipLabel: { fontSize: 14, fontWeight: '500' },
  privacy: { fontSize: 12, lineHeight: 18 },
});
