import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { THEMES, THEME_IDS, type ThemeId, type ThemePalette } from '@/theme/palettes';
import { useThemeStore } from '@/theme/store';
import { useTheme } from '@/theme/use-theme';

// 미리보기는 이미지가 아니라 토큰으로 그린 미니어처 — 팔레트를 추가하면 미리보기도 따라온다 (THEME_SYSTEM §3)
function ThemePreview({ palette }: { palette: ThemePalette }) {
  return (
    <View style={[preview.frame, { backgroundColor: palette.background, borderColor: palette.border }]}>
      <View style={preview.header}>
        <View style={[preview.brand, { backgroundColor: palette.text }]} />
        <View style={[preview.headerIcon, { backgroundColor: palette.icon }]} />
      </View>
      <View style={[preview.searchBar, { backgroundColor: palette.searchBar, borderColor: palette.border }]} />
      <View style={preview.favoriteRow}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={[preview.favorite, { backgroundColor: palette.favoriteArea, borderColor: palette.border }]}
          />
        ))}
      </View>
      {[0, 1].map((i) => (
        <View key={i} style={[preview.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <View style={[preview.badge, { backgroundColor: palette.badge }]} />
        </View>
      ))}
      <View style={[preview.nav, { backgroundColor: palette.navigation, borderColor: palette.border }]}>
        <View style={[preview.navDot, { backgroundColor: palette.navigationActive }]} />
        <View style={[preview.navDot, { backgroundColor: palette.textMuted }]} />
        <View style={[preview.navDot, { backgroundColor: palette.textMuted }]} />
      </View>
    </View>
  );
}

export default function ThemeScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const themeId = useThemeStore((s) => s.themeId);
  const setThemeId = useThemeStore((s) => s.setThemeId);

  return (
    <Screen edges={[]}>
      <ScrollView contentContainerStyle={styles.list}>
        <Text style={[styles.current, { color: theme.textMuted }]}>
          {t('theme.current')} · {t(`theme.names.${themeId}`)}
        </Text>
        <View style={styles.grid}>
          {THEME_IDS.map((id: ThemeId) => {
            const selected = id === themeId;
            return (
              <Pressable
                key={id}
                onPress={() => setThemeId(id)}
                accessibilityLabel={t(`theme.names.${id}`)}
                style={[
                  styles.item,
                  { borderColor: selected ? theme.primary : theme.border },
                  selected && styles.itemSelected,
                ]}>
                <ThemePreview palette={THEMES[id]} />
                <View style={styles.nameRow}>
                  <Text style={[styles.name, { color: theme.text }]}>{t(`theme.names.${id}`)}</Text>
                  {selected ? <Ionicons name="checkmark-circle" size={16} color={theme.primary} /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, paddingBottom: 32 },
  current: { fontSize: 13, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  item: { width: '47%', borderWidth: 1.5, borderRadius: 14, padding: 8, gap: 8 },
  itemSelected: { borderWidth: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { fontSize: 13, fontWeight: '600' },
});

const preview = StyleSheet.create({
  frame: { borderRadius: 10, borderWidth: 1, padding: 8, gap: 6, aspectRatio: 0.62 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { width: 42, height: 8, borderRadius: 3, opacity: 0.9 },
  headerIcon: { width: 8, height: 8, borderRadius: 4 },
  searchBar: { height: 12, borderRadius: 6, borderWidth: StyleSheet.hairlineWidth },
  favoriteRow: { flexDirection: 'row', gap: 5 },
  favorite: { flex: 1, height: 22, borderRadius: 5, borderWidth: StyleSheet.hairlineWidth },
  card: {
    height: 20,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  badge: { width: 10, height: 10, borderRadius: 5 },
  nav: {
    marginTop: 'auto',
    height: 16,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  navDot: { width: 6, height: 6, borderRadius: 3 },
});
