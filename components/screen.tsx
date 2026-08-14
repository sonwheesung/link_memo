import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/theme/use-theme';

interface ScreenProps {
  children: ReactNode;
  /** 하단 고정 영역 — Phase 6에서 배너 광고 자리로 쓴다 (docs/MONETIZATION_SYSTEM.md §2.1) */
  footer?: ReactNode;
  /** 스택 헤더가 있는 화면은 SafeArea 상단을 겹으로 먹지 않도록 끈다 */
  edges?: ('top' | 'bottom')[];
}

export function Screen({ children, footer, edges = ['top'] }: ScreenProps) {
  const theme = useTheme();

  return (
    <SafeAreaView edges={edges} style={[styles.safe, { backgroundColor: theme.background }]}>
      <View style={styles.content}>{children}</View>
      {footer}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flex: 1 },
});
