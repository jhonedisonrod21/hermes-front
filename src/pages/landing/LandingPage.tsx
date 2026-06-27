import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { HermesDial } from '../../components/HermesDial';
import { LandingServices } from './LandingServices';

const PILLARS = ['catalog', 'schedule', 'team'] as const;
const STEPS = ['reserved', 'paid', 'attended', 'completed'] as const;
const ROLES = ['admin', 'tenantAdmin', 'partner', 'guest'] as const;

export function LandingPage() {
  const { t } = useTranslation('landing');

  return (
    <div className="lp">
      <header className="lp-topbar">
        <Link to="/" className="lp-wordmark" aria-label="Hermes Calendar">
          <img src="/brand/hermes-logo-simple-transparent.svg" alt="" className="lp-wordmark-mark" />
          <span>
            <strong>Hermes</strong>
            <em>Calendar</em>
          </span>
        </Link>
        <div className="lp-topbar-actions">
          <LanguageSwitcher />
          <Link to="/acceso" className="lp-link-quiet">
            {t('nav.signIn')}
          </Link>
          <Link to="/acceso?registro=1" className="lp-btn lp-btn-gold lp-btn-sm">
            {t('nav.getStarted')}
          </Link>
        </div>
      </header>

      {/* Hero — abre con el instrumento más característico del sujeto */}
      <section className="lp-hero">
        <div className="lp-hero-copy">
          <p className="lp-eyebrow">{t('hero.eyebrow')}</p>
          <h1 className="lp-display">
            {t('hero.titleLead')} <span className="lp-underline">{t('hero.titleKey')}</span>{' '}
            {t('hero.titleTail')}
          </h1>
          <p className="lp-lede">{t('hero.lede')}</p>
          <div className="lp-hero-cta">
            <Link to="/acceso?registro=1" className="lp-btn lp-btn-gold">
              {t('hero.primary')}
              <ArrowRight size={18} />
            </Link>
            <Link to="/acceso" className="lp-btn lp-btn-ghost">
              {t('hero.secondary')}
            </Link>
          </div>
          <p className="lp-coords">{t('hero.coords')}</p>
        </div>
        <div className="lp-hero-signature" aria-hidden="true">
          <HermesDial />
          <div className="lp-readout">
            <span className="lp-readout-time">09:00</span>
            <span className="lp-readout-label">{t('hero.readout')}</span>
          </div>
        </div>
      </section>

      {/* Pilares — capacidades en paralelo (sin numerar: no son una secuencia) */}
      <section className="lp-pillars">
        <div className="lp-section-head">
          <p className="lp-eyebrow lp-eyebrow-dark">{t('pillars.eyebrow')}</p>
          <h2 className="lp-display lp-h2">{t('pillars.title')}</h2>
        </div>
        <div className="lp-pillar-grid">
          {PILLARS.map((key) => (
            <article className="lp-pillar" key={key}>
              <span className="lp-pillar-tag">/{t(`pillars.${key}.tag`)}</span>
              <h3>{t(`pillars.${key}.title`)}</h3>
              <p>{t(`pillars.${key}.body`)}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Vitrina de servicios reales (solo si el catálogo público está disponible) */}
      <LandingServices />

      {/* Ciclo de una cita — SÍ es una secuencia: el número codifica el orden real */}
      <section className="lp-lifecycle">
        <div className="lp-section-head">
          <p className="lp-eyebrow">{t('lifecycle.eyebrow')}</p>
          <h2 className="lp-display lp-h2 lp-h2-light">{t('lifecycle.title')}</h2>
        </div>
        <ol className="lp-track">
          {STEPS.map((key, i) => (
            <li className="lp-step" key={key}>
              <span className="lp-step-index">{String(i + 1).padStart(2, '0')}</span>
              <span className="lp-step-name">{t(`lifecycle.${key}.name`)}</span>
              <span className="lp-step-note">{t(`lifecycle.${key}.note`)}</span>
            </li>
          ))}
        </ol>
        <p className="lp-lifecycle-foot">{t('lifecycle.foot')}</p>
      </section>

      {/* Roles — los 4 actores del dominio */}
      <section className="lp-roles">
        <div className="lp-section-head">
          <p className="lp-eyebrow lp-eyebrow-dark">{t('roles.eyebrow')}</p>
          <h2 className="lp-display lp-h2">{t('roles.title')}</h2>
        </div>
        <div className="lp-role-grid">
          {ROLES.map((key) => (
            <article className="lp-role" key={key}>
              <h3>{t(`roles.${key}.title`)}</h3>
              <p>{t(`roles.${key}.body`)}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Cierre — la firma reaparece, pequeña */}
      <section className="lp-final">
        <HermesDial className="lp-dial-echo" labels={false} />
        <h2 className="lp-display lp-h2 lp-h2-light">{t('final.title')}</h2>
        <p className="lp-lede">{t('final.lede')}</p>
        <Link to="/acceso?registro=1" className="lp-btn lp-btn-gold">
          {t('final.cta')}
          <ArrowRight size={18} />
        </Link>
      </section>

      <footer className="lp-footer">
        <span>{t('footer.left')}</span>
        <span className="lp-footer-coords">{t('footer.right')}</span>
      </footer>
    </div>
  );
}
