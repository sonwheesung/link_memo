import Constants from 'expo-constants';
import { randomUUID } from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { createCommonServer } from '@/lib/common-server';

// 기기 토큰(device subject)으로 문의를 귀속한다 — 로그인이 아니다 (CLAUDE.md §4, 2026-08-14 정정).
// 세션 토큰·deviceId는 SecureStore에 보관한다(자격증명 성격 — AsyncStorage 금지).
export const commonServer = createCommonServer({
  baseUrl: process.env.EXPO_PUBLIC_SERVER_URL ?? 'https://common-server.vercel.app',
  appCode: 'linkmemo',
  appVersion: Constants.expoConfig?.version ?? '0.0.0',
  platform: Platform.OS,
  storage: {
    getItem: (key) => SecureStore.getItemAsync(key),
    setItem: (key, value) => SecureStore.setItemAsync(key, value),
    removeItem: (key) => SecureStore.deleteItemAsync(key),
  },
});

export const APP_VERSION = Constants.expoConfig?.version ?? '0.0.0';

const DEVICE_ID_KEY = 'linkmemo_device_id';

/**
 * 기기 세션 확보 — 문의 전송·내역 조회 전에 부른다. 멱등이라 여러 번 불러도 안전하다.
 * 실패해도(오프라인 등) 문의 전송 자체는 익명으로라도 가능하므로 호출부를 막지 않는다.
 */
export async function ensureDeviceSession(): Promise<boolean> {
  try {
    if (await commonServer.isSignedIn()) return true;
    let deviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = randomUUID();
      await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId);
    }
    const r = await commonServer.registerDevice(deviceId);
    return r.ok;
  } catch {
    return false;
  }
}
