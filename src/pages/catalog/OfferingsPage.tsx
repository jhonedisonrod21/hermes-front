import { useCallback, useState } from 'react';
import { Pencil, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/PageHeader';
import { DataState } from '../../components/DataState';
import { Badge, Button, Card, Pagination, SearchInput, Select } from '../../components/ui';
import { OfferingFormModal } from './OfferingFormModal';
import { useResource } from '../../hooks/useResource';
import { useClientTable } from '../../hooks/useClientTable';
import { useToast } from '../../components/feedback/toast';
import { useConfirm } from '../../components/feedback/confirm';
import { catalogApi } from '../../api/services';
import type { OfferingResponse } from '../../api/types';
import { formatDuration, formatMoney } from '../../lib/format';

const matchOffering = (o: OfferingResponse, q: string) =>
  o.name.toLowerCase().includes(q) || (o.category ?? '').toLowerCase().includes(q);

export function OfferingsPage() {
  const { t, i18n } = useTranslation(['catalog', 'common']);
  const toast = useToast();
  const confirm = useConfirm();
  const offerings = useResource(() => catalogApi.listOfferings({ size: 200, sort: 'name,asc' }), []);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<OfferingResponse | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const items = offerings.data?.content ?? [];
  const visible = statusFilter ? items.filter((o) => (statusFilter === 'active' ? o.active : !o.active)) : items;
  const { paged, page, setPage, totalPages, total } = useClientTable(visible, {
    query,
    match: useCallback(matchOffering, [])
  });

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }
  function openEdit(o: OfferingResponse) {
    setEditing(o);
    setModalOpen(true);
  }

  async function toggleActive(o: OfferingResponse) {
    if (o.active) {
      const ok = await confirm({
        title: t('catalog:confirm.deactivateTitle'),
        message: t('catalog:confirm.deactivateMessage', { name: o.name }),
        confirmLabel: t('catalog:actions.deactivate'),
        danger: true
      });
      if (!ok) return;
    }
    setBusyId(o.id);
    try {
      await catalogApi.setActive(o.id, !o.active);
      toast.success(o.active ? t('catalog:toast.deactivated') : t('catalog:toast.activated'));
      offerings.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common:feedback.error'));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow={t('catalog:eyebrow')}
        title={t('catalog:title')}
        description={t('catalog:description')}
        actions={
          <Button icon={<Plus size={18} />} onClick={openCreate}>
            {t('catalog:actions.new')}
          </Button>
        }
      />

      <Card className="table-card">
        <div className="table-toolbar">
          <div className="table-toolbar-filters">
            <SearchInput
              placeholder={t('catalog:searchPlaceholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Select
              className="toolbar-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              placeholder={t('catalog:allStatus')}
              options={[
                { value: 'active', label: t('catalog:status.active') },
                { value: 'inactive', label: t('catalog:status.inactive') }
              ]}
            />
          </div>
          <span className="table-toolbar-count">{t('common:pagination.items', { count: total })}</span>
        </div>
        <DataState
          loading={offerings.loading}
          error={offerings.error}
          empty={items.length === 0}
          emptyMessage={t('catalog:empty')}
          onRetry={offerings.reload}
        >
          <div className="hc-table-scroll">
          <table className="hc-table">
            <thead>
              <tr>
                <th>{t('catalog:fields.name')}</th>
                <th>{t('catalog:fields.category')}</th>
                <th>{t('catalog:fields.modality')}</th>
                <th>{t('catalog:fields.duration')}</th>
                <th>{t('catalog:fields.price')}</th>
                <th>{t('catalog:fields.status')}</th>
                <th aria-label={t('common:actions.label')} />
              </tr>
            </thead>
            <tbody>
              {paged.map((o) => (
                <tr key={o.id}>
                  <td>
                    <strong>{o.name}</strong>
                    {o.requiresOnlinePayment ? (
                      <Badge tone="accent" className="row-badge">
                        {t('catalog:badges.onlinePayment')}
                      </Badge>
                    ) : null}
                    {o.requirements?.length ? (
                      <Badge tone="info" className="row-badge">
                        {t('catalog:badges.requirements', { count: o.requirements.length })}
                      </Badge>
                    ) : null}
                  </td>
                  <td>{o.category ?? '—'}</td>
                  <td>{t(`catalog:modality.${o.modality}`, o.modality)}</td>
                  <td>{formatDuration(o.durationMinutes, t('common:units.hour'), t('common:units.minute'))}</td>
                  <td>{formatMoney(o.priceAmount, o.priceCurrency, i18n.language)}</td>
                  <td>
                    <Badge tone={o.active ? 'success' : 'danger'}>
                      {o.active ? t('catalog:status.active') : t('catalog:status.inactive')}
                    </Badge>
                  </td>
                  <td className="row-actions">
                    <Button variant="ghost" size="sm" icon={<Pencil size={15} />} onClick={() => openEdit(o)}>
                      {t('common:actions.edit')}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={busyId === o.id}
                      onClick={() => toggleActive(o)}
                    >
                      {o.active ? t('catalog:actions.deactivate') : t('catalog:actions.activate')}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          <Pagination page={page} totalPages={totalPages} totalElements={total} onChange={setPage} />
        </DataState>
      </Card>

      <OfferingFormModal
        open={modalOpen}
        editing={editing}
        categories={Array.from(new Set(items.map((o) => o.category).filter((c): c is string => Boolean(c)))).sort()}
        onClose={() => setModalOpen(false)}
        onSaved={offerings.reload}
      />
    </div>
  );
}
