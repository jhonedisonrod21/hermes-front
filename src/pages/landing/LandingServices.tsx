import { useEffect, useState } from 'react';
import { ArrowRight, Clock, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { OfferingSearchResult } from '../../api/types';
import { formatDuration, formatMoney } from '../../lib/format';

/**
 * Vitrina pública de servicios en la landing: atrae a usuarios no registrados mostrando oferta
 * real. Consume el catálogo público (/catalog/search) SIN sesión; si ese endpoint no está abierto
 * (requiere permitAll en gateway + catalog-service) o no hay datos, la sección no se renderiza,
 * de modo que la landing nunca se ve rota.
 */
export function LandingServices() {
  const { t, i18n } = useTranslation(['landing', 'catalog', 'common']);
  const [items, setItems] = useState<OfferingSearchResult[]>([]);

  useEffect(() => {
    let active = true;
    fetch('/catalog/search?size=8', { headers: { Accept: 'application/json' } })
      .then((r) => (r.ok ? r.json() : null))
      .then((page) => {
        if (active && page?.content?.length) setItems(page.content.slice(0, 8));
      })
      .catch(() => {
        /* Sin catálogo público: la vitrina simplemente no aparece. */
      });
    return () => {
      active = false;
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="lp-showcase">
      <div className="lp-section-head">
        <p className="lp-eyebrow lp-eyebrow-dark">{t('landing:showcase.eyebrow')}</p>
        <h2 className="lp-display lp-h2">{t('landing:showcase.title')}</h2>
        <p className="lp-showcase-lede">{t('landing:showcase.lede')}</p>
      </div>

      <div className="lp-showcase-grid">
        {items.map((o) => (
          <Link to="/acceso?registro=1" className="lp-showcase-card" key={o.id}>
            <div className="lp-showcase-card-head">
              <span className="lp-showcase-modality">{t(`catalog:modality.${o.modality}`, o.modality)}</span>
              <span className="lp-showcase-price">{formatMoney(o.priceAmount, o.priceCurrency, i18n.language)}</span>
            </div>
            <h3 className="lp-showcase-name">{o.name}</h3>
            {o.tenantName ? (
              <p className="lp-showcase-org">
                <MapPin size={13} /> {o.tenantName}
              </p>
            ) : null}
            <div className="lp-showcase-foot">
              <span className="lp-showcase-duration">
                <Clock size={14} /> {formatDuration(o.durationMinutes, t('common:units.hour'), t('common:units.minute'))}
              </span>
              <span className="lp-showcase-book">
                {t('landing:showcase.book')} <ArrowRight size={14} />
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="lp-showcase-cta">
        <Link to="/acceso?registro=1" className="lp-btn lp-btn-gold">
          {t('landing:showcase.cta')}
          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}
