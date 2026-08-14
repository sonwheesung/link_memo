import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/use-theme';

// Phase 6 전까지 배너 광고 자리를 미리 보여주는 플레이스홀더 (docs/MONETIZATION_SYSTEM.md §2.1).
// 실제 AdMob 배너로 교체되면 이 컴포넌트는 삭제한다 — 실광고는 "미수신 시 자리 미점유" 규칙을 따른다.
export function AdBannerPlaceholder() {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <View style={[styles.box, { borderColor: theme.border, backgroundColor: theme.surface }]}>
      <Text style={[styles.tag, { color: theme.textMuted, borderColor: theme.textMuted }]}>AD</Text>
      <Text style={[styles.label, { color: theme.textMuted }]}>{t('ads.bannerPlaceholder')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    height: 60,
    marginHorizontal: 12,
    marginBottom: 6,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  tag: {
    fontSize: 10,
    fontWeight: '700',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  label: { fontSize: 13 },
});
