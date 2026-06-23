import { useCallback, useState } from 'react';
import { Pencil, Plus, UsersRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/PageHeader';
import { DataState } from '../../components/DataState';
import { Badge, Button, Card, Pagination, SearchInput, Select } from '../../components/ui';
import { TenantFormModal } from './TenantFormModal';
import { TenantMembersModal } from './TenantMembersModal';
import { useResource } from '../../hooks/useResource';
import { useClientTable } from '../../hooks/useClientTable';
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
  const tenants = useResource(() => tenantApi.listTenants({ size: 200, sort: 'createdAt,desc' }), []);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formEditing, setFormEditing] = useState<TenantResponse | null>(null);
  const [membersOf, setMembersOf] = useState<TenantResponse | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const items = tenants.data?.content ?? [];
  const visible = statusFilter ? items.filter((tn) => tn.status === statusFilter) : items;
  const { paged, page, setPage, totalPages, total } = useClientTable(visible, {
    query,
    match: useCallback(matchTenant, []),
    resetKey: statusFilter
  });

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
      tenants.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common:feedback.error'));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow={t('admin:tenants.eyebrow')}
        title={t('admin:tenants.title')}
        description={t('admin:tenants.description')}
        actions={
          <Button icon={<Plus size={18} />} onClick={openCreate}>
            {t('admin:tenants.new')}
          </Button>
        }
      />

      <Card className="table-card">
        <div className="table-toolbar">
          <div className="table-toolbar-filters">
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
          </div>
          <span className="table-toolbar-count">{t('common:pagination.items', { count: total })}</span>
        </div>
        <DataState
          loading={tenants.loading}
          error={tenants.error}
          empty={total === 0}
          emptyMessage={t('admin:tenants.empty')}
          onRetry={tenants.reload}
        >
          <div className="hc-table-scroll">
          <table className="hc-table">
            <thead>
              <tr>
                <th>{t('admin:tenants.name')}</th>
                <th>{t('admin:tenants.slug')}</th>
                <th>{t('admin:tenants.location')}</th>
                <th>{t('admin:tenants.status')}</th>
                <th>{t('admin:tenants.created')}</th>
                <th aria-label={t('common:actions.label')} />
              </tr>
            </thead>
            <tbody>
              {paged.map((tn) => (
                <tr key={tn.id}>
                  <td><strong>{tn.name}</strong></td>
                  <td><code>{tn.slug}</code></td>
                  <td>{[tn.city, tn.country].filter(Boolean).join(', ') || '—'}</td>
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
          <Pagination page={page} totalPages={totalPages} totalElements={total} onChange={setPage} />
        </DataState>
      </Card>

      <TenantFormModal open={formOpen} editing={formEditing} onClose={() => setFormOpen(false)} onSaved={() => tenants.reload()} />
      <TenantMembersModal tenant={membersOf} onClose={() => setMembersOf(null)} />
    </div>
  );
}
