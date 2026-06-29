import { useMemo, useState } from 'react';
import { Pencil, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/PageHeader';
import { DataState } from '../../components/DataState';
import { Badge, Button, Card, Pagination, SearchInput, Select } from '../../components/ui';
import { OfferingFormModal } from './OfferingFormModal';
import { useServerTable } from '../../hooks/useServerTable';
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
  const table = useServerTable((p) => catalogApi.listOfferings({ ...p, sort: 'name,asc' }), { size: 12 });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<OfferingResponse | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // El endpoint no acepta búsqueda; el filtro/búsqueda se aplica sobre la página cargada (se avisa).
  const q = query.trim().toLowerCase();
  const clientFiltered = useMemo(
    () =>
      table.items
        .filter((o) => (statusFilter ? (statusFilter === 'active' ? o.active : !o.active) : true))
        .filter((o) => (q ? matchOffering(o, q) : true)),
    [table.items, statusFilter, q]
  );
  const pageFilterActive = Boolean(q || statusFilter);

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
      table.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common:feedback.error'));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="page">
      <PageHeader
        title={t('catalog:title')}
        description={t('catalog:description')}
        actions={
          <Button icon={<Plus size={18} />} onClick={openCreate}>
            {t('catalog:actions.new')}
          </Button>
        }
        tools={
          <>
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
            <span className="table-toolbar-count">{t('common:pagination.items', { count: table.totalElements })}</span>
            {pageFilterActive ? (
              <span className="table-toolbar-hint" title={t('common:pagination.currentPageFilterHint')}>
                {t('common:pagination.currentPageFilter')}
              </span>
            ) : null}
          </>
        }
      />

      <Card className="table-card">
        <DataState
          loading={table.loading}
          error={table.error}
          empty={clientFiltered.length === 0}
          emptyMessage={t('catalog:empty')}
          onRetry={table.reload}
        >
          <div className="hc-table-scroll">
          <table className="hc-table catalog-table">
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
              {clientFiltered.map((o) => (
                <tr key={o.id}>
                  <td>
                    <strong className="cell-upper">{o.name}</strong>
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
                  <td className="cell-upper">{o.category ?? '—'}</td>
                  <td className="cell-upper">{t(`catalog:modality.${o.modality}`, o.modality)}</td>
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
          <Pagination
            page={table.page}
            totalPages={table.totalPages}
            totalElements={table.totalElements}
            onChange={table.setPage}
          />
        </DataState>
      </Card>

      <OfferingFormModal
        open={modalOpen}
        editing={editing}
        categories={Array.from(new Set(table.items.map((o) => o.category).filter((c): c is string => Boolean(c)))).sort((a, b) => a.localeCompare(b))}
        onClose={() => setModalOpen(false)}
        onSaved={table.reload}
      />
    </div>
  );
}
