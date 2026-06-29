import { CalendarRange, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/** Tercera sección: valor para clientes corporativos (gestión de calendario + reportes/comprobantes). */
const FEATURES = [
  { key: 'calendar', Icon: CalendarRange },
  { key: 'reports', Icon: FileText }
];

export function LandingCorporate() {
  const { t } = useTranslation('landing');

  return (
    <section className="lp-corporate">
      <div className="lp-corporate-head">
        <h2>{t('corporate.title')}</h2>
        <p>{t('corporate.subtitle')}</p>
      </div>
      <div className="lp-corporate-grid">
        {FEATURES.map(({ key, Icon }) => (
          <article className="lp-feature" key={key}>
            <span className="lp-feature-icon" aria-hidden="true">
              <Icon size={44} strokeWidth={1.6} />
            </span>
            <div className="lp-feature-text">
              <h3>{t(`corporate.items.${key}.title`)}</h3>
              <p>{t(`corporate.items.${key}.body`)}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
