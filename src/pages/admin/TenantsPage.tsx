import { useMemo, useState } from 'react';
import { Pencil, Plus, UsersRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/PageHeader';
import { DataState } from '../../components/DataState';
import { Badge, Button, Card, Pagination, SearchInput, Select } from '../../components/ui';
import { TenantFormModal } from './TenantFormModal';
import { TenantMembersModal } from './TenantMembersModal';
import { useServerTable } from '../../hooks/useServerTable';
import { useToast } from '../../components/feedback/toast';
import { useConfirm } from '../../components/feedback/confirm';
import { tenantApi } from '../../api/services';
import type { TenantResponse } from '../../api/types';
import { formatDate } from '../../lib/format';

// El backend solo maneja ACTIVE / INACTIVE (enum TenantStatus).
const STATUS_TONE: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
  ACTIVE: 'success',
  INACTIVE: 'danger'
};

const NEXT_STATUS: Record<string, string> = { ACTIVE: 'INACTIVE', INACTIVE: 'ACTIVE' };
const STATUSES = ['ACTIVE', 'INACTIVE'];

const matchTenant = (tn: TenantResponse, q: string) =>
  tn.name.toLowerCase().includes(q) || tn.slug.toLowerCase().includes(q) || (tn.city ?? '').toLowerCase().includes(q);

export function TenantsPage() {
  const { t, i18n } = useTranslation(['admin', 'common']);
  const toast = useToast();
  const confirm = useConfirm();
  const table = useServerTable((p) => tenantApi.listTenants({ ...p, sort: 'createdAt,desc' }), { size: 12 });
  const [busyId, setBusyId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formEditing, setFormEditing] = useState<TenantResponse | null>(null);
  const [membersOf, setMembersOf] = useState<TenantResponse | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // El endpoint no acepta búsqueda; el filtro/búsqueda se aplica sobre la página cargada (se avisa).
  const q = query.trim().toLowerCase();
  const clientFiltered = useMemo(
    () =>
      table.items
        .filter((tn) => (statusFilter ? tn.status === statusFilter : true))
        .filter((tn) => (q ? matchTenant(tn, q) : true)),
    [table.items, statusFilter, q]
  );
  const pageFilterActive = Boolean(q || statusFilter);

  function openCreate() {
    setFormEditing(null);
    setFormOpen(true);
  }
  function openEdit(tn: TenantResponse) {
    setFormEditing(tn);
    setFormOpen(true);
  }

  async function cycleStatus(tn: TenantResponse) {
    const next = NEXT_STATUS[tn.status] ?? 'ACTIVE';
    if (next === 'INACTIVE') {
      const ok = await confirm({
        title: t('admin:tenants.confirm.suspendTitle'),
        message: t('admin:tenants.confirm.suspendMessage', { name: tn.name }),
        confirmLabel: t('admin:tenants.suspend'),
        danger: true
      });
      if (!ok) return;
    }
    setBusyId(tn.id);
    try {
      await tenantApi.setTenantStatus(tn.id, { status: next });
      toast.success(t('common:feedback.updated'));
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
        title={t('admin:tenants.title')}
        description={t('admin:tenants.description')}
        actions={
          <Button icon={<Plus size={18} />} onClick={openCreate}>
            {t('admin:tenants.new')}
          </Button>
        }
        tools={
          <>
            <SearchInput
              placeholder={t('admin:tenants.searchPlaceholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Select
              className="toolbar-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              placeholder={t('admin:tenants.allStatus')}
              options={STATUSES.map((s) => ({ value: s, label: t(`admin:tenants.statusValues.${s}`, s) }))}
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
          emptyMessage={t('admin:tenants.empty')}
          onRetry={table.reload}
        >
          <div className="hc-table-scroll">
          <table className="hc-table">
            <thead>
              <tr>
                <th>{t('admin:tenants.name')}</th>
                <th>{t('admin:tenants.location')}</th>
                <th>{t('admin:tenants.status')}</th>
                <th>{t('admin:tenants.created')}</th>
                <th aria-label={t('common:actions.label')} />
              </tr>
            </thead>
            <tbody>
              {clientFiltered.map((tn) => (
                <tr key={tn.id}>
                  <td><strong className="cell-upper">{tn.name}</strong></td>
                  <td className="cell-upper">{[tn.city, tn.country].filter(Boolean).join(', ') || '—'}</td>
                  <td>
                    <Badge tone={STATUS_TONE[tn.status] ?? 'info'}>{t(`admin:tenants.statusValues.${tn.status}`, tn.status)}</Badge>
                  </td>
                  <td className="cell-nowrap">{formatDate(tn.createdAt, i18n.language)}</td>
                  <td className="row-actions">
                    <Button variant="ghost" size="sm" icon={<Pencil size={15} />} onClick={() => openEdit(tn)}>
                      {t('common:actions.edit')}
                    </Button>
                    <Button variant="ghost" size="sm" icon={<UsersRound size={15} />} onClick={() => setMembersOf(tn)}>
                      {t('admin:tenants.members')}
                    </Button>
                    <Button
                      variant={tn.status === 'ACTIVE' ? 'danger' : 'secondary'}
                      size="sm"
                      disabled={busyId === tn.id}
                      onClick={() => cycleStatus(tn)}
                    >
                      {tn.status === 'ACTIVE' ? t('admin:tenants.suspend') : t('admin:tenants.activate')}
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

      <TenantFormModal open={formOpen} editing={formEditing} onClose={() => setFormOpen(false)} onSaved={() => table.reload()} />
      <TenantMembersModal tenant={membersOf} onClose={() => setMembersOf(null)} />
    </div>
  );
}
