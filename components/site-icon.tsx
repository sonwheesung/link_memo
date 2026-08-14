import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/use-theme';

interface SiteIconProps {
  name: string;
  favicon: string | null;
  size?: number;
}

// favicon 렌더 + 실패 시 이니셜 폴백 (docs/SITE_SYSTEM.md §2). 디스크 캐시는 expo-image 담당.
export function SiteIcon({ name, favicon, size = 40 }: SiteIconProps) {
  const theme = useTheme();
  const [failed, setFailed] = useState(false);
  const radius = Math.round(size * 0.25);

  if (favicon && !failed) {
    return (
      <Image
        source={{ uri: favicon }}
        style={{ width: size, height: size, borderRadius: radius }}
        contentFit="contain"
        cachePolicy="disk"
        transition={100}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        { width: size, height: size, borderRadius: radius, backgroundColor: theme.selected },
      ]}>
      <Text style={{ color: theme.primary, fontSize: size * 0.45, fontWeight: '700' }}>
        {name.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { alignItems: 'center', justifyContent: 'center' },
});
