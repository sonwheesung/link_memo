import mobileAds, { AdsConsent, AdsConsentStatus } from 'react-native-google-mobile-ads';

import { useAdsStore } from '@/features/ads/store';

// 광고 초기화 — UMP 동의(EEA)를 먼저, 그다음 SDK init (docs/MONETIZATION_SYSTEM.md §3).
// 어떤 실패도 앱 사용을 막지 않는다: 실패하면 ready=false로 남아 광고만 안 나갈 뿐이다.
let started = false;

export async function initAds(): Promise<void> {
  if (started) return;
  started = true;

  try {
    // EEA·영국·스위스에서만 REQUIRED가 온다. 그 외 지역은 NOT_REQUIRED — 폼 없이 통과.
    const info = await AdsConsent.requestInfoUpdate();
    if (info.isConsentFormAvailable && info.status === AdsConsentStatus.REQUIRED) {
      await AdsConsent.showForm();
    }
  } catch {
    // 동의 조회 실패(오프라인 등) — 다음 콜드 스타트에서 다시 시도된다
  }

  try {
    await mobileAds().initialize();
    useAdsStore.getState().setReady(true);
  } catch {
    // 초기화 실패 — 광고 없이 계속
  }
}
