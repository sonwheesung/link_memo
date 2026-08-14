import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { createCommonServer } from '@/lib/common-server';

// 로그인이 없는 앱이라 storage(세션 영속화)를 넘기지 않는다 — 문의는 익명 단방향 (CLAUDE.md §4)
export const commonServer = createCommonServer({
  baseUrl: process.env.EXPO_PUBLIC_SERVER_URL ?? 'https://common-server.vercel.app',
  appCode: 'linkmemo',
  appVersion: Constants.expoConfig?.version ?? '0.0.0',
  platform: Platform.OS,
});

export const APP_VERSION = Constants.expoConfig?.version ?? '0.0.0';
