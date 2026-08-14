import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet } from 'react-native';

import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { TextField } from '@/components/text-field';
import { createSite, getSite, updateSite } from '@/features/sites/api';
import { normalizeUrl, suggestSiteName } from '@/features/sites/url';

// 사이트 추가 + 수정을 한 화면이 겸한다 (/site-add?id=) — 조각의 write?id 패턴 승계
export default function SiteAddScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editing = useMemo(() => (id ? getSite(id) : null), [id]);

  const [url, setUrl] = useState(editing?.url ?? '');
  const [name, setName] = useState(editing?.name ?? '');
  const [urlError, setUrlError] = useState<string | undefined>(undefined);

  const suggestion = url.trim() ? suggestSiteName(url) : '';

  const save = () => {
    const normalized = normalizeUrl(url);
    if (!normalized) {
      setUrlError(t('site.invalidUrl'));
      return;
    }
    // 이름 미입력이면 자동 제안값을 저장 (URL만 필수 — CLAUDE.md §5)
    const finalName = name.trim() || suggestSiteName(normalized);
    if (editing) {
      updateSite(editing.id, { name: finalName, url: normalized });
    } else {
      createSite({ name: finalName, url: normalized });
    }
    router.back();
  };

  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ title: editing ? t('site.edit') : t('site.add') }} />
      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <TextField
          label={t('site.url')}
          value={url}
          onChangeText={(v) => {
            setUrl(v);
            if (urlError) setUrlError(undefined);
          }}
          error={urlError}
          placeholder="example.com"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          autoFocus={!editing}
        />
        <TextField
          label={t('site.name')}
          value={name}
          onChangeText={setName}
          placeholder={suggestion || t('site.namePlaceholder')}
        />
        <Button label={t('common.save')} onPress={save} disabled={!url.trim()} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { padding: 20, gap: 16 },
});
