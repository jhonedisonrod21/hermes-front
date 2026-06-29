import { useMemo, useState } from 'react';
import { ShieldCheck, Trash2, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/PageHeader';
import { DataState } from '../../components/DataState';
import { Badge, Button, Card, Pagination, Select } from '../../components/ui';
import { useServerTable } from '../../hooks/useServerTable';
import { useResource } from '../../hooks/useResource';
import { useToast } from '../../components/feedback/toast';
import { useConfirm } from '../../components/feedback/confirm';
import { tenantApi, identityApi } from '../../api/services';
import type { MembershipResponse } from '../../api/types';
import { formatDate } from '../../lib/format';
import { roleLabel } from '../../lib/roles';
import { AddMemberModal } from './AddMemberModal';

// Roles que pueden aparecer entre los miembros (para el filtro).
const ALL_ROLES = ['TENANT_ADMIN', 'TENANT_PARTNER'];

export function MembersPage() {
  const { t, i18n } = useTranslation(['team', 'common']);
  const toast = useToast();
  const confirm = useConfirm();
  const table = useServerTable((p) => tenantApi.listMyMembers(p), { size: 12 });
  const [roleFilter, setRoleFilter] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const clientFiltered = useMemo(
    () => (roleFilter ? table.items.filter((m) => m.roles.includes(roleFilter)) : table.items),
    [table.items, roleFilter]
  );

  // Resuelve cada userId -> ficha (nombre/correo) desde el directorio, para no mostrar el id.
  const idsKey = useMemo(
    () => [...new Set(table.items.map((m) => m.userId))].sort().join(','),
    [table.items]
  );
  const cards = useResource(
    () => (idsKey ? identityApi.getUserCards(idsKey.split(',').slice(0, 100)) : Promise.resolve([])),
    [idsKey]
  );
  const cardFor = useMemo(() => {
    const map = new Map((cards.data ?? []).map((c) => [c.id, c]));
    return (id: string) => map.get(id);
  }, [cards.data]);

  async function remove(m: MembershipResponse) {
    const card = cardFor(m.userId);
    const ok = await confirm({
      title: t('team:confirm.removeTitle'),
      message: t('team:confirm.removeMessage', { name: card?.name || card?.email || `${m.userId.slice(0, 8)}…` }),
      confirmLabel: t('common:actions.delete'),
      danger: true
    });
    if (!ok) return;
    setBusyId(m.userId);
    try {
      await tenantApi.removeMyMember(m.userId);
      toast.success(t('common:feedback.deleted'));
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
        eyebrow={t('team:eyebrow')}
        title={t('team:title')}
        description={t('team:description')}
        tools={
          <>
            <Select
              className="toolbar-filter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              placeholder={t('team:allRoles')}
              options={ALL_ROLES.map((r) => ({ value: r, label: roleLabel(t, r) }))}
            />
            <span className="table-toolbar-count">{t('common:pagination.items', { count: table.totalElements })}</span>
            <Button icon={<UserPlus size={17} />} onClick={() => setAddOpen(true)}>
              {t('team:actions.add')}
            </Button>
          </>
        }
      />

      <Card className="table-card">
        <DataState
          loading={table.loading}
          error={table.error}
          empty={clientFiltered.length === 0}
          emptyMessage={t('team:empty')}
          onRetry={table.reload}
        >
          <div className="hc-table-scroll">
            <table className="hc-table">
              <thead>
                <tr>
                  <th>{t('team:fields.member')}</th>
                  <th>{t('team:fields.roles')}</th>
                  <th>{t('team:fields.status')}</th>
                  <th>{t('team:fields.since')}</th>
                  <th aria-label={t('common:actions.label')} />
                </tr>
              </thead>
              <tbody>
                {clientFiltered.map((m) => {
                  const card = cardFor(m.userId);
                  // Un administrador de organización solo lo gestiona el administrador del sistema:
                  // no se ofrece dar de baja a un TENANT_ADMIN (ni a uno mismo) desde aquí.
                  const isOrgAdmin = m.roles.includes('TENANT_ADMIN');
                  return (
                    <tr key={m.id}>
                      <td className="cell-clamp">
                        <strong className={card?.name ? 'cell-upper' : undefined}>
                          {card?.name || card?.email || `${m.userId.slice(0, 8)}…`}
                        </strong>
                        {card?.name && card.email ? <span className="member-email">{card.email}</span> : null}
                      </td>
                      <td className="cell-chips">
                        {m.roles.map((r) => (
                          <Badge key={r} tone="info">{roleLabel(t, r)}</Badge>
                        ))}
                      </td>
                      <td>
                        <Badge tone={m.status === 'ACTIVE' ? 'success' : 'warning'}>
                          {t(`common:statusValues.${m.status}`, m.status)}
                        </Badge>
                      </td>
                      <td className="cell-nowrap">{formatDate(m.createdAt, i18n.language)}</td>
                      <td className="row-actions">
                        {isOrgAdmin ? (
                          <span className="member-locked" title={t('team:adminManagedBySystem')}>
                            <ShieldCheck size={16} />
                          </span>
                        ) : (
                          <button
                            className="hc-icon-button"
                            type="button"
                            onClick={() => remove(m)}
                            disabled={busyId === m.userId}
                            aria-label={t('common:actions.delete')}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
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

      <AddMemberModal open={addOpen} onClose={() => setAddOpen(false)} onAdded={table.reload} />
    </div>
  );
}
