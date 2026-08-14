import AsyncStorage from '@react-native-async-storage/async-storage';
import { AdEventType, AppOpenAd, TestIds } from 'react-native-google-mobile-ads';

import { adsEnabled } from '@/features/ads/store';

// App Open 광고 — 콜드 스타트에만, 쿨타임 3시간 (docs/MONETIZATION_SYSTEM.md §2.2).
// 포그라운드 복귀·브라우저 복귀에는 절대 띄우지 않는다(호출부가 콜드 스타트 1회만 부른다).
const UNIT_ID = __DEV__ ? TestIds.APP_OPEN : 'ca-app-pub-2731473780180274/9500642536';
const LAST_SHOWN_KEY = 'linkmemo-appopen-last';
const COOLDOWN_MS = 3 * 60 * 60 * 1000;
const LOAD_TIMEOUT_MS = 8000;

export async function maybeShowAppOpenAd(): Promise<void> {
  if (!adsEnabled()) return;

  try {
    const last = Number((await AsyncStorage.getItem(LAST_SHOWN_KEY)) ?? 0);
    // 쿨타임이 안 지났으면 로드조차 하지 않는다 (트래픽 낭비 금지)
    if (Date.now() - last < COOLDOWN_MS) return;
  } catch {
    return;
  }

  const ad = AppOpenAd.createForAdRequest(UNIT_ID);

  await new Promise<void>((resolve) => {
    let done = false;
    const finish = () => {
      if (!done) {
        done = true;
        resolve();
      }
    };
    ad.addAdEventListener(AdEventType.LOADED, () => {
      void AsyncStorage.setItem(LAST_SHOWN_KEY, String(Date.now()));
      ad.show().catch(() => {});
      finish();
    });
    ad.addAdEventListener(AdEventType.ERROR, finish);
    // 로드가 늦으면 포기한다 — 앱 시작을 광고가 붙잡지 않는다
    setTimeout(finish, LOAD_TIMEOUT_MS);
    ad.load();
  });
}
