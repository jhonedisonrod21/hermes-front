import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { en } from './locales/en';
import { es } from './locales/es';

export const supportedLanguages = ['es', 'en'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es,
      en
    },
    fallbackLng: 'es',
    supportedLngs: supportedLanguages,
    defaultNS: 'common',
    ns: ['common', 'auth', 'dashboard', 'app', 'overview', 'catalog', 'schedule', 'team', 'organization', 'admin', 'explore', 'appointments', 'reports', 'bookings', 'account', 'landing'],
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'hermes.language'
    }
  });

export { i18n };
