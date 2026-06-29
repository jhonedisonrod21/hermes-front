import { useCallback, useEffect, useState } from 'react';
import { CalendarPlus, Clock, Eye, MapPin, SlidersHorizontal, Tag } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DataState } from '../../components/DataState';
import { Badge, Button, Pagination } from '../../components/ui';
import { BookingModal } from './BookingModal';
import { OfferingDetailModal } from './OfferingDetailModal';
import { catalogApi } from '../../api/services';
import { useAuth } from '../../hermes-security/useAuth';
import type { OfferingSearchResult } from '../../api/types';
import { formatDuration, formatMoney } from '../../lib/format';

const PAGE_SIZE = 12;

/** Opciones de modalidad para los radio buttons del panel de filtros. */
const MODALITY_OPTIONS = [
  { value: '', labelKey: 'explore:anyModality' },
  { value: 'IN_PERSON', labelKey: 'catalog:modality.IN_PERSON' },
  { value: 'VIRTUAL', labelKey: 'catalog:modality.VIRTUAL' },
  { value: 'BOTH', labelKey: 'catalog:modality.BOTH' }
];

export function ExplorePage() {
  const { t, i18n } = useTranslation(['explore', 'catalog', 'common']);
  const { authenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQ = searchParams.get('q') ?? '';
  const [q, setQ] = useState(initialQ);
  const [modality, setModality] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [items, setItems] = useState<OfferingSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [booking, setBooking] = useState<OfferingSearchResult | null>(null);
  const [detail, setDetail] = useState<OfferingSearchResult | null>(null);

  const runSearch = useCallback(async (text: string, mod: string, pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await catalogApi.searchPublic({
        q: text || undefined,
        modality: mod || undefined,
        page: pageNum,
        size: PAGE_SIZE
      });
      setItems(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, []);

  // Nueva búsqueda desde el top-bar (?q=): reinicia modalidad y vuelve a la primera página.
  useEffect(() => {
    setQ(initialQ);
    setModality('');
    setPage(0);
    runSearch(initialQ, '', 0);
  }, [runSearch, initialQ]);

  function changeModality(value: string) {
    setModality(value);
    setPage(0);
    runSearch(q, value, 0);
  }
  function changePage(value: number) {
    setPage(value);
    runSearch(q, modality, value);
  }

  // Reservar exige sesión: un visitante sin cuenta va primero a acceder.
  function book(o: OfferingSearchResult) {
    if (authenticated) setBooking(o);
    else navigate('/acceso');
  }

  function renderCard(o: OfferingSearchResult) {
    return (
      <article className="svc-card" key={o.id}>
        <div className="svc-card-band">
          <Badge tone="info">{t(`catalog:modality.${o.modality}`, o.modality)}</Badge>
          {o.priceAmount != null && o.priceAmount > 0 ? (
            <span className="svc-price">{formatMoney(o.priceAmount, o.priceCurrency, i18n.language)}</span>
          ) : null}
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
        </div>
        <div className="svc-card-foot">
          <span className="svc-duration">
            <Clock size={14} /> {formatDuration(o.durationMinutes, t('common:units.hour'), t('common:units.minute'))}
          </span>
          {o.requiresOnlinePayment ? <span className="svc-pay">{t('explore:onlinePayment')}</span> : null}
        </div>
        <div className="svc-card-actions">
          <Button variant="accent" icon={<CalendarPlus size={16} />} onClick={() => book(o)}>
            {t('explore:book')}
          </Button>
          <Button variant="secondary" icon={<Eye size={16} />} onClick={() => setDetail(o)}>
            {t('explore:view')}
          </Button>
        </div>
      </article>
    );
  }

  return (
    <div className="page explore-page">
      <div className="explore-layout">
        {/* Sección izquierda: filtros (se adapta al ancho de su contenido). */}
        <aside className="explore-filters">
          <div className="explore-filters-head">
            <SlidersHorizontal size={16} />
            <strong>{t('explore:filtersTitle')}</strong>
          </div>
          <fieldset className="explore-radio-group">
            <legend>{t('catalog:fields.modality')}</legend>
            {MODALITY_OPTIONS.map((opt) => (
              <label className="explore-radio" key={opt.value || 'any'}>
                <input
                  type="radio"
                  name="modality"
                  checked={modality === opt.value}
                  onChange={() => changeModality(opt.value)}
                />
                <span>{t(opt.labelKey)}</span>
              </label>
            ))}
          </fieldset>
        </aside>

        {/* Sección derecha: resultados en tarjetas + paginación. */}
        <div className="explore-results">
          <DataState
            loading={loading}
            error={error}
            empty={items.length === 0}
            emptyMessage={t('explore:noResults')}
            onRetry={() => runSearch(q, modality, page)}
          >
            <div className="svc-grid">{items.map((o) => renderCard(o))}</div>
            <Pagination page={page} totalPages={totalPages} totalElements={totalElements} onChange={changePage} />
          </DataState>
        </div>
      </div>

      <BookingModal offering={booking} onClose={() => setBooking(null)} />
      <OfferingDetailModal offering={detail} onClose={() => setDetail(null)} onBook={book} />
    </div>
  );
}
