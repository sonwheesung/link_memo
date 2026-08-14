import { THEMES, type ThemePalette } from '@/theme/palettes';
import { useThemeStore } from '@/theme/store';

export function useTheme(): ThemePalette {
  const themeId = useThemeStore((s) => s.themeId);
  return THEMES[themeId];
}
