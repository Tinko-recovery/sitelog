import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import * as Localization from 'expo-localization'

import en from './en.json'
import hi from './hi.json'
import kn from './kn.json'

// ─── Add a new language ───────────────────────────────────────────────────────
// 1. Drop a new JSON file in this folder (e.g. ta.json for Tamil)
// 2. Uncomment the two lines below (import + resources entry)
// import ta from './ta.json'
// ─────────────────────────────────────────────────────────────────────────────

export type SupportedLanguage = 'en' | 'hi' | 'kn'

export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, string> = {
  en: 'English',
  hi: 'हिंदी',
  kn: 'ಕನ್ನಡ',
}

function detectDeviceLanguage(): SupportedLanguage {
  const locale = Localization.getLocales()[0]?.languageCode ?? 'en'
  if (locale.startsWith('kn')) return 'kn'
  if (locale.startsWith('hi')) return 'hi'
  return 'en'
}

export const defaultLanguage: SupportedLanguage = detectDeviceLanguage()

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    kn: { translation: kn },
    // ta: { translation: ta },  ← uncomment for Tamil
  },
  lng: defaultLanguage,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
