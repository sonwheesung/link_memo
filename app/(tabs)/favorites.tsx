import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Phase 0 골격 — Phase 3에서 즐겨찾기 목록으로 대체
export default function FavoritesScreen() {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.empty}>{t('favorites.empty')}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  empty: { fontSize: 15, opacity: 0.6 },
});
