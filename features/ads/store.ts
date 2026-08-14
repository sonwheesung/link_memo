import { create } from 'zustand';

// 광고 게이트의 단일 출처 (docs/MONETIZATION_SYSTEM.md §3)
// Phase 7에서 Remove Ads 구매 상태가 여기 연결된다 — 게이트는 이 store 한 곳만 본다.
interface AdsState {
  /** SDK 초기화(+동의 흐름) 완료 여부 */
  ready: boolean;
  /** Remove Ads 구매 여부 — Phase 7에서 RevenueCat과 연결 */
  removeAds: boolean;
  setReady: (ready: boolean) => void;
  setRemoveAds: (removeAds: boolean) => void;
}

export const useAdsStore = create<AdsState>()((set) => ({
  ready: false,
  removeAds: false,
  setReady: (ready) => set({ ready }),
  setRemoveAds: (removeAds) => set({ removeAds }),
}));

export function adsEnabled(): boolean {
  const s = useAdsStore.getState();
  return s.ready && !s.removeAds;
}
