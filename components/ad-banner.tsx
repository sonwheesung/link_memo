import { useState } from 'react';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

import { useAdsStore } from '@/features/ads/store';

// 홈 하단 배너 (docs/MONETIZATION_SYSTEM.md §2.1)
// 미수신·미초기화·구매자면 자리를 차지하지 않는다 — 빈 회색 띠 금지.
const UNIT_ID = __DEV__ ? TestIds.ADAPTIVE_BANNER : 'ca-app-pub-2731473780180274/8027778765';

export function AdBanner() {
  const ready = useAdsStore((s) => s.ready);
  const removeAds = useAdsStore((s) => s.removeAds);
  const [failed, setFailed] = useState(false);

  if (!ready || removeAds || failed) return null;

  return (
    <BannerAd
      unitId={UNIT_ID}
      size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      onAdFailedToLoad={() => setFailed(true)}
    />
  );
}
