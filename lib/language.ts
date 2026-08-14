import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import i18n, { detectDeviceLanguage, SUPPORTED_LANGUAGES, type AppLanguage } from '@/lib/i18n';

interface LanguageState {
  /** null = 시스템 언어 따르기 */
  override: AppLanguage | null;
  setOverride: (lang: AppLanguage | null) => void;
}

function apply(lang: AppLanguage | null) {
  void i18n.changeLanguage(lang ?? detectDeviceLanguage());
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      override: null,
      setOverride: (lang) => {
        set({ override: lang });
        apply(lang);
      },
    }),
    {
      name: 'linkmemo-language',
      storage: createJSONStorage(() => AsyncStorage),
      merge: (persisted, current) => {
        const p = persisted as Partial<LanguageState> | undefined;
        const override =
          p?.override && (SUPPORTED_LANGUAGES as readonly string[]).includes(p.override)
            ? p.override
            : null;
        return { ...current, override };
      },
      onRehydrateStorage: () => (state) => {
        // 저장된 수동 선택이 있으면 부팅 시 적용 (없으면 i18n 초기값=기기 언어 유지)
        if (state?.override) apply(state.override);
      },
    },
  ),
);
