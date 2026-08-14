import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '@/locales/en.json';
import ja from '@/locales/ja.json';
import ko from '@/locales/ko.json';
import zhHans from '@/locales/zh-Hans.json';
import zhHant from '@/locales/zh-Hant.json';

export const SUPPORTED_LANGUAGES = ['en', 'ko', 'ja', 'zh-Hans', 'zh-Hant'] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

// 언어 자기표기 — 번역하지 않는다(각 언어 사용자가 자기 언어를 찾는 라벨)
export const LANGUAGE_LABELS: Record<AppLanguage, string> = {
  en: 'English',
  ko: '한국어',
  ja: '日本語',
  'zh-Hans': '简体中文',
  'zh-Hant': '繁體中文',
};

/** 기기 언어 → 지원 언어 매핑. 중국어는 스크립트/지역으로 간체·번체를 가른다 (docs/I18N_SYSTEM.md §4). */
export function detectDeviceLanguage(): AppLanguage {
  const locale = Localization.getLocales()[0];
  const code = locale?.languageCode ?? 'en';
  if (code === 'zh') {
    // Locale 타입에 스크립트 필드가 없어 languageTag("zh-Hant-TW" 등)로 판별한다
    const tag = locale?.languageTag ?? '';
    const region = locale?.regionCode ?? '';
    if (/hant/i.test(tag) || ['TW', 'HK', 'MO'].includes(region)) return 'zh-Hant';
    return 'zh-Hans';
  }
  if ((SUPPORTED_LANGUAGES as readonly string[]).includes(code)) return code as AppLanguage;
  return 'en';
}

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ko: { translation: ko },
    ja: { translation: ja },
    'zh-Hans': { translation: zhHans },
    'zh-Hant': { translation: zhHant },
  },
  lng: detectDeviceLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false,
});

export default i18n;
