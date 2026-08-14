import { useEffect, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { APP_VERSION } from '@/features/support/server';
import { useBootStore } from '@/features/support/store';
import { compareVersions } from '@/lib/common-server';
import { useTheme } from '@/theme/use-theme';

// 진입 게이트 — 판정은 서버 응답으로만, 실패 시 앱을 막지 않는다 (ARCHITECTURE §5.2)
// ⚠ 차단 화면에는 반드시 출구를 둔다: 스토어 URL이 없으면 안내문이라도 (my_word 데드엔드 사고 승계)
export function BootGate({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const boot = useBootStore((s) => s.boot);
  const fetchOnce = useBootStore((s) => s.fetchOnce);

  useEffect(() => {
    fetchOnce();
  }, [fetchOnce]);

  if (boot?.maintenance.active) {
    return (
      <View style={[styles.block, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.text }]}>{boot.maintenance.title}</Text>
        <Text style={[styles.body, { color: theme.textMuted }]}>{boot.maintenance.body}</Text>
      </View>
    );
  }

  const min = boot?.version.min;
  if (min && compareVersions(APP_VERSION, min) < 0) {
    const storeUrl = boot?.version.androidUrl ?? boot?.version.iosUrl ?? null;
    return (
      <View style={[styles.block, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.text }]}>{t('gate.updateTitle')}</Text>
        <Text style={[styles.body, { color: theme.textMuted }]}>{t('gate.updateBody')}</Text>
        {storeUrl ? (
          <Button label={t('gate.updateButton')} onPress={() => void Linking.openURL(storeUrl)} />
        ) : (
          <Text style={[styles.body, { color: theme.textMuted }]}>{t('gate.updateNoStore')}</Text>
        )}
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  block: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 14 },
  title: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
  body: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
});
