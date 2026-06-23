import { useState, type FormEvent } from 'react';
import { Clock, MapPin, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/PageHeader';
import { DataState } from '../../components/DataState';
import { Badge, Button, Card, Select, TextField } from '../../components/ui';
import { catalogApi } from '../../api/services';
import type { OfferingSearchResult } from '../../api/types';
import type { Page } from '../../api/http';
import { formatDuration, formatMoney } from '../../lib/format';

export function ExplorePage() {
  const { t, i18n } = useTranslation(['explore', 'catalog', 'common']);
  const [query, setQuery] = useState({ q: '', modality: '' });
  const [results, setResults] = useState<Page<OfferingSearchResult> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [searched, setSearched] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const page = await catalogApi.search({ q: query.q || undefined, modality: query.modality || undefined, size: 50 });
      setResults(page);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }

  const items = results?.content ?? [];

  return (
    <div className="page">
      <PageHeader eyebrow={t('explore:eyebrow')} title={t('explore:title')} description={t('explore:description')} />

      <Card className="panel">
        <form className="hc-form explore-form" onSubmit={submit}>
          <TextField
            label={t('explore:fields.query')}
            leadingIcon={<Search size={18} />}
            placeholder={t('explore:fields.queryPlaceholder')}
            value={query.q}
            onChange={(e) => setQuery((q) => ({ ...q, q: e.target.value }))}
          />
          <Select
            label={t('catalog:fields.modality')}
            value={query.modality}
            onChange={(e) => setQuery((q) => ({ ...q, modality: e.target.value }))}
            placeholder={t('explore:anyModality')}
            options={[
              { value: 'IN_PERSON', label: t('catalog:modality.IN_PERSON') },
              { value: 'VIRTUAL', label: t('catalog:modality.VIRTUAL') },
              { value: 'BOTH', label: t('catalog:modality.BOTH') }
            ]}
          />
          <Button type="submit" icon={<Search size={17} />} disabled={loading}>
            {t('explore:search')}
          </Button>
        </form>
      </Card>

      {searched ? (
        <DataState loading={loading} error={error} empty={items.length === 0} emptyMessage={t('explore:noResults')}>
          <div className="offering-grid">
            {items.map((o) => (
              <Card key={o.id} className="offering-card">
                <div className="offering-card-head">
                  <h3>{o.name}</h3>
                  <Badge tone="info">{t(`catalog:modality.${o.modality}`, o.modality)}</Badge>
                </div>
                {o.tenantName ? (
                  <p className="offering-tenant"><MapPin size={14} /> {o.tenantName}</p>
                ) : null}
                {o.description ? <p className="offering-desc">{o.description}</p> : null}
                <div className="offering-card-foot">
                  <span><Clock size={14} /> {formatDuration(o.durationMinutes, t('common:units.hour'), t('common:units.minute'))}</span>
                  <strong>{formatMoney(o.priceAmount, o.priceCurrency, i18n.language)}</strong>
                </div>
              </Card>
            ))}
          </div>
        </DataState>
      ) : null}
    </div>
  );
}
