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
    ns: ['common', 'auth', 'dashboard', 'app', 'overview', 'catalog', 'schedule', 'team', 'organization', 'admin', 'explore', 'appointments', 'reports', 'bookings', 'account', 'landing', 'payments'],
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'hermes.language'
    }
  });

// Mantiene el atributo <html lang> sincronizado con el idioma activo (accesibilidad e i18n).
function syncHtmlLang(lng: string) {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = (lng || 'es').split('-')[0];
  }
}
syncHtmlLang(i18n.language);
i18n.on('languageChanged', syncHtmlLang);

export { i18n };
