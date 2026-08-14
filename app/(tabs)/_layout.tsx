import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

// 하단 네비 4탭: Home · +(사이트 추가 동작) · Favorites · Settings (CLAUDE.md §3 — Search 탭 없음)
export default function TabLayout() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('common.home'),
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: t('common.add'),
          tabBarIcon: ({ color, size }) => <Ionicons name="add-circle" size={size + 6} color={color} />,
        }}
        listeners={{
          // 탭이 아니라 사이트 추가 화면을 띄우는 동작 (조각의 ⊕ 패턴 승계)
          tabPress: (e) => {
            e.preventDefault();
            router.push('/site-add');
          },
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: t('common.favorites'),
          tabBarIcon: ({ color, size }) => <Ionicons name="heart-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('common.settings'),
          tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
