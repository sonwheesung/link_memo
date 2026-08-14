import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Phase 0 골격 — Theme(1)·Remove Ads(7)·Data·App Information 행이 단계별로 들어온다
export default function SettingsScreen() {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>{t('settings.title')}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, padding: 24 },
  title: { fontSize: 24, fontWeight: '700' },
});
