import { useCallback, useEffect, useMemo, useState } from 'react';
import { Building2, CalendarPlus, Clock, LayoutGrid, MapPin, Search, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DataState } from '../../components/DataState';
import { HermesDial } from '../../components/HermesDial';
import { Button, Select } from '../../components/ui';
import { BookingModal } from './BookingModal';
import { catalogApi } from '../../api/services';
import type { OfferingSearchResult } from '../../api/types';
import { formatDuration, formatMoney } from '../../lib/format';

const MODALITIES = ['', 'IN_PERSON', 'VIRTUAL', 'BOTH'];
type View = 'grid' | 'tenant';

/** Iniciales de la organización para el avatar (hasta 2 letras). */
function orgInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export function ExplorePage() {
  const { t, i18n } = useTranslation(['explore', 'catalog', 'common']);
  const [q, setQ] = useState('');
  const [modality, setModality] = useState('');
  const [view, setView] = useState<View>('grid');
  const [items, setItems] = useState<OfferingSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [booking, setBooking] = useState<OfferingSearchResult | null>(null);

  const runSearch = useCallback(async (text: string, mod: string) => {
    setLoading(true);
    setError(null);
    try {
      const page = await catalogApi.search({ q: text || undefined, modality: mod || undefined, size: 60 });
      setItems(page.content);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, []);

  // Muestra servicios desde el primer momento (sin pantalla en blanco).
  useEffect(() => {
    runSearch('', '');
  }, [runSearch]);

  // Agrupa los servicios por organización (para la vista "Por organización").
  const groups = useMemo(() => {
    const map = new Map<string, { name: string; items: OfferingSearchResult[] }>();
    for (const o of items) {
      const key = o.tenantId || o.tenantName || 'sin-org';
      const entry = map.get(key) ?? { name: o.tenantName || t('explore:unknownOrg'), items: [] };
      entry.items.push(o);
      map.set(key, entry);
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [items, t]);

  function renderCard(o: OfferingSearchResult, showTenant: boolean) {
    return (
      <article className="svc-card" key={o.id}>
        <div className="svc-card-band">
          <span className="svc-modality">{t(`catalog:modality.${o.modality}`, o.modality)}</span>
          <span className="svc-price">{formatMoney(o.priceAmount, o.priceCurrency, i18n.language)}</span>
        </div>
        <div className="svc-card-body">
          <h3>{o.name}</h3>
          {showTenant && o.tenantName ? (
            <p className="svc-tenant">
              <MapPin size={14} /> {o.tenantName}
            </p>
          ) : null}
          {o.category ? (
            <p className="svc-category">
              <Tag size={13} /> {o.category}
            </p>
          ) : null}
          {o.description ? <p className="svc-desc">{o.description}</p> : null}
        </div>
        <div className="svc-card-foot">
          <span className="svc-duration">
            <Clock size={14} /> {formatDuration(o.durationMinutes, t('common:units.hour'), t('common:units.minute'))}
          </span>
          {o.requiresOnlinePayment ? <span className="svc-pay">{t('explore:onlinePayment')}</span> : null}
        </div>
        <Button variant="accent" fullWidth icon={<CalendarPlus size={17} />} onClick={() => setBooking(o)}>
          {t('explore:book')}
        </Button>
      </article>
    );
  }

  return (
    <div className="page explore-page">
      <header className="explore-hero">
        <HermesDial className="explore-hero-dial" labels={false} />
        <div className="explore-hero-copy">
          <p className="eyebrow">{t('explore:eyebrow')}</p>
          <h1>{t('explore:heroTitle')}</h1>
          <p>{t('explore:heroSubtitle')}</p>
        </div>
        <form
          className="explore-searchbar"
          onSubmit={(e) => {
            e.preventDefault();
            runSearch(q, modality);
          }}
        >
          <span className="explore-search-field">
            <Search size={18} />
            <input
              type="search"
              placeholder={t('explore:fields.queryPlaceholder')}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label={t('explore:fields.query')}
            />
          </span>
          <Select
            className="explore-modality"
            aria-label={t('catalog:fields.modality')}
            value={modality}
            onChange={(e) => setModality(e.target.value)}
            placeholder={t('explore:anyModality')}
            options={MODALITIES.filter(Boolean).map((m) => ({ value: m, label: t(`catalog:modality.${m}`) }))}
          />
          <Button type="submit" icon={<Search size={17} />}>
            {t('explore:search')}
          </Button>
        </form>
      </header>

      <DataState loading={loading} error={error} empty={items.length === 0} emptyMessage={t('explore:noResults')} onRetry={() => runSearch(q, modality)}>
        <div className="explore-toolbar">
          <p className="explore-count">
            {t('common:pagination.items', { count: items.length })}
            {view === 'tenant' ? ` · ${t('explore:orgsCount', { count: groups.length })}` : ''}
          </p>
          <div className="explore-view-toggle" role="group" aria-label={t('explore:viewLabel')}>
            <button
              type="button"
              className={view === 'grid' ? 'is-active' : ''}
              aria-pressed={view === 'grid'}
              onClick={() => setView('grid')}
            >
              <LayoutGrid size={15} /> {t('explore:viewServices')}
            </button>
            <button
              type="button"
              className={view === 'tenant' ? 'is-active' : ''}
              aria-pressed={view === 'tenant'}
              onClick={() => setView('tenant')}
            >
              <Building2 size={15} /> {t('explore:viewByOrg')}
            </button>
          </div>
        </div>

        {view === 'grid' ? (
          <div className="svc-grid">{items.map((o) => renderCard(o, true))}</div>
        ) : (
          <div className="explore-orgs">
            {groups.map((g) => (
              <section className="explore-org" key={g.name}>
                <div className="explore-org-head">
                  <span className="explore-org-avatar" aria-hidden="true">{orgInitials(g.name)}</span>
                  <div className="explore-org-info">
                    <h2>{g.name}</h2>
                    <span className="explore-org-meta">{t('explore:servicesCount', { count: g.items.length })}</span>
                  </div>
                </div>
                <div className="svc-grid">{g.items.map((o) => renderCard(o, false))}</div>
              </section>
            ))}
          </div>
        )}
      </DataState>

      <BookingModal offering={booking} onClose={() => setBooking(null)} />
    </div>
  );
}
