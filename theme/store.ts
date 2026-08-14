import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { DEFAULT_THEME_ID, THEME_IDS, type ThemeId } from '@/theme/palettes';

interface ThemeState {
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themeId: DEFAULT_THEME_ID,
      setThemeId: (id) => set({ themeId: id }),
    }),
    {
      name: 'linkmemo-theme',
      storage: createJSONStorage(() => AsyncStorage),
      // 저장값이 깨졌거나 미래에 테마가 사라진 경우 기본 테마로 복원
      merge: (persisted, current) => {
        const p = persisted as Partial<ThemeState> | undefined;
        const themeId =
          p?.themeId && (THEME_IDS as readonly string[]).includes(p.themeId)
            ? p.themeId
            : DEFAULT_THEME_ID;
        return { ...current, themeId };
      },
    },
  ),
);
