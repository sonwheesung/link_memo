import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '@/locales/en.json';
import ko from '@/locales/ko.json';

// Phase 4에서 ja·zh-Hans·zh-Hant 추가 (docs/I18N_SYSTEM.md)
export const SUPPORTED_LANGUAGES = ['en', 'ko'] as const;

const deviceLanguage = Localization.getLocales()[0]?.languageCode ?? 'en';

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ko: { translation: ko },
  },
  lng: (SUPPORTED_LANGUAGES as readonly string[]).includes(deviceLanguage) ? deviceLanguage : 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false,
});

export default i18n;
