import type { PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';
import { PublicTopbar } from './PublicTopbar';
import { SiteFooter } from './SiteFooter';

/**
 * Cara pública (sin sesión): top-bar con búsqueda + contenido + footer común. La comparten la landing
 * y la página de exploración para que ambas tengan la misma navegación.
 */
export function PublicShell({ children }: Readonly<PropsWithChildren>) {
  const { t } = useTranslation('landing');

  return (
    <div className="public-shell">
      <PublicTopbar>
        <LanguageSwitcher />
        <Link to="/acceso" className="public-topbar-link">
          {t('nav.signIn')}
        </Link>
        <Link to="/acceso?registro=1" className="hc-button hc-button-accent hc-button-sm">
          {t('nav.getStarted')}
        </Link>
      </PublicTopbar>
      {children}
      <SiteFooter />
    </div>
  );
}
