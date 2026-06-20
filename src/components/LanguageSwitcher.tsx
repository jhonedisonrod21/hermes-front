import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supportedLanguages, type SupportedLanguage } from '../i18n';

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation('common');
  const currentLanguage = i18n.resolvedLanguage?.startsWith('en') ? 'en' : 'es';

  function changeLanguage(language: SupportedLanguage) {
    void i18n.changeLanguage(language);
  }

  return (
    <div className="language-switcher" aria-label={t('language.label')}>
      <Languages size={17} />
      <div className="language-options">
        {supportedLanguages.map((language) => (
          <button
            aria-pressed={currentLanguage === language}
            className={currentLanguage === language ? 'language-option language-option-active' : 'language-option'}
            key={language}
            onClick={() => changeLanguage(language)}
            type="button"
          >
            {t(`language.${language}`)}
          </button>
        ))}
      </div>
    </div>
  );
}
