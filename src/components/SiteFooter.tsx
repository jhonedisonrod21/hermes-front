import { useTranslation } from 'react-i18next';

/**
 * Footer común (estilo sitio web): marca + columnas de enlaces + copyright. Compartido por la landing
 * y la experiencia del usuario invitado. Maquetación: los enlaces son marcadores de posición.
 */
export function SiteFooter() {
  const { t } = useTranslation('common');
  const year = new Date().getFullYear();

  const columns = [
    { title: t('footer.product'), links: [t('footer.links.features'), t('footer.links.pricing')] },
    { title: t('footer.company'), links: [t('footer.links.about'), t('footer.links.contact')] },
    { title: t('footer.legal'), links: [t('footer.links.terms'), t('footer.links.privacy')] }
  ];

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <span className="site-footer-wordmark">
            <img src="/brand/hermes-logo-simple-transparent.svg" alt="" />
            <span>
              <strong>Hermes</strong>
              <em>Calendar</em>
            </span>
          </span>
          <p>{t('footer.tagline')}</p>
        </div>
        <nav className="site-footer-cols" aria-label={t('footer.legal')}>
          {columns.map((col) => (
            <div className="site-footer-col" key={col.title}>
              <h4>{col.title}</h4>
              {col.links.map((label) => (
                <a key={label} href="#" className="site-footer-link">
                  {label}
                </a>
              ))}
            </div>
          ))}
        </nav>
      </div>
      <div className="site-footer-bottom">
        <span>© {year} Hermes Calendar. {t('footer.rights')}</span>
      </div>
    </footer>
  );
}
