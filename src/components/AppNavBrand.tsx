import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export function AppNavBrand() {
  const { t } = useTranslation('common');

  return (
    <Link to="/" className="app-nav-brand" aria-label={t('brand.ariaLabel')}>
      <img alt="" className="app-nav-brand-mark" src="/brand/hermes-logo-simple-transparent.svg" />
      <div className="app-nav-brand-text">
        <strong>Hermes</strong>
        <span>Calendar</span>
      </div>
    </Link>
  );
}
