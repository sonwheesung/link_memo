import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { LANGUAGE_LABELS, SUPPORTED_LANGUAGES, type AppLanguage } from '@/lib/i18n';
import { useLanguageStore } from '@/lib/language';
import { useTheme } from '@/theme/use-theme';

export default function LanguageScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const override = useLanguageStore((s) => s.override);
  const setOverride = useLanguageStore((s) => s.setOverride);

  const options: { value: AppLanguage | null; label: string }[] = [
    { value: null, label: t('language.system') },
    ...SUPPORTED_LANGUAGES.map((lang) => ({ value: lang as AppLanguage | null, label: LANGUAGE_LABELS[lang] })),
  ];

  return (
    <Screen edges={[]}>
      <View style={styles.list}>
        {options.map((option) => {
          const selected = override === option.value;
          return (
            <Pressable
              key={option.value ?? 'system'}
              onPress={() => setOverride(option.value)}
              style={[
                styles.row,
                {
                  backgroundColor: selected ? theme.selected : theme.card,
                  borderColor: selected ? theme.primary : theme.border,
                },
              ]}>
              <Text style={[styles.label, { color: theme.text }]}>{option.label}</Text>
              {selected ? <Ionicons name="checkmark" size={18} color={theme.primary} /> : null}
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: 20, gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  label: { fontSize: 16, fontWeight: '500' },
});
