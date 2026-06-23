import { useCallback, useEffect, useState } from 'react';
import { CalendarPlus, Clock, MapPin, Search, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DataState } from '../../components/DataState';
import { HermesDial } from '../../components/HermesDial';
import { Button } from '../../components/ui';
import { BookingModal } from './BookingModal';
import { catalogApi } from '../../api/services';
import type { OfferingSearchResult } from '../../api/types';
import { formatDuration, formatMoney } from '../../lib/format';

const MODALITIES = ['', 'IN_PERSON', 'VIRTUAL', 'BOTH'];

export function ExplorePage() {
  const { t, i18n } = useTranslation(['explore', 'catalog', 'common']);
  const [q, setQ] = useState('');
  const [modality, setModality] = useState('');
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
          <span className="explore-search-modality">
            <select value={modality} onChange={(e) => setModality(e.target.value)} aria-label={t('catalog:fields.modality')}>
              {MODALITIES.map((m) => (
                <option key={m || 'any'} value={m}>
                  {m ? t(`catalog:modality.${m}`) : t('explore:anyModality')}
                </option>
              ))}
            </select>
          </span>
          <Button type="submit" icon={<Search size={17} />}>
            {t('explore:search')}
          </Button>
        </form>
      </header>

      <DataState loading={loading} error={error} empty={items.length === 0} emptyMessage={t('explore:noResults')} onRetry={() => runSearch(q, modality)}>
        <p className="explore-count">{t('common:pagination.items', { count: items.length })}</p>
        <div className="svc-grid">
          {items.map((o) => (
            <article className="svc-card" key={o.id}>
              <div className="svc-card-band">
                <span className="svc-modality">{t(`catalog:modality.${o.modality}`, o.modality)}</span>
                <span className="svc-price">{formatMoney(o.priceAmount, o.priceCurrency, i18n.language)}</span>
              </div>
              <div className="svc-card-body">
                <h3>{o.name}</h3>
                {o.tenantName ? (
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
          ))}
        </div>
      </DataState>

      <BookingModal offering={booking} onClose={() => setBooking(null)} />
    </div>
  );
}
