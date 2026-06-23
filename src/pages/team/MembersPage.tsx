import { useCallback, useState, type FormEvent } from 'react';
import { Trash2, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/PageHeader';
import { DataState } from '../../components/DataState';
import { Badge, Button, Card, Pagination, SearchInput, Select, TextField } from '../../components/ui';
import { useResource } from '../../hooks/useResource';
import { useClientTable } from '../../hooks/useClientTable';
import { useMutation } from '../../hooks/useMutation';
import { useToast } from '../../components/feedback/toast';
import { useConfirm } from '../../components/feedback/confirm';
import { tenantApi } from '../../api/services';
import type { MembershipResponse } from '../../api/types';
import { formatDate } from '../../lib/format';
import { roleLabel } from '../../lib/roles';

// Roles que pueden aparecer entre los miembros (para el filtro).
const ALL_ROLES = ['TENANT_ADMIN', 'TENANT_PARTNER'];
// El TENANT_ADMIN solo puede dar de alta Profesionales; el rol Administrador
// lo concede únicamente el administrador del sistema (lo refleja el backend:
// /me/members siempre crea un TENANT_PARTNER).
const ADD_ROLE = 'TENANT_PARTNER';

const matchMember = (m: MembershipResponse, q: string) =>
  m.userId.toLowerCase().includes(q) || m.roles.some((r) => r.toLowerCase().includes(q));

export function MembersPage() {
  const { t, i18n } = useTranslation(['team', 'common']);
  const toast = useToast();
  const confirm = useConfirm();
  const members = useResource(() => tenantApi.listMyMembers({ size: 200 }), []);
  const [form, setForm] = useState({ userId: '' });
  const [userIdError, setUserIdError] = useState<string>();
  const add = useMutation(() => tenantApi.addMyMember({ userId: form.userId.trim(), role: ADD_ROLE }));
  const [busyId, setBusyId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const items = members.data?.content ?? [];
  const visible = roleFilter ? items.filter((m) => m.roles.includes(roleFilter)) : items;
  const { paged, page, setPage, totalPages, total } = useClientTable(visible, {
    query,
    match: useCallback(matchMember, []),
    resetKey: roleFilter
  });

  async function submit(e: FormEvent) {
    e.preventDefault();
    // El backend espera un UUID exacto; validarlo evita un 400 sin detalle.
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(form.userId.trim())) {
      setUserIdError(t('common:validation.uuid'));
      return;
    }
    try {
      await add.run();
      toast.success(t('team:toast.added'));
      setForm({ userId: '' });
      members.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common:feedback.error'));
    }
  }

  async function remove(m: MembershipResponse) {
    const ok = await confirm({
      title: t('team:confirm.removeTitle'),
      message: t('team:confirm.removeMessage', { id: m.userId }),
      confirmLabel: t('common:actions.delete'),
      danger: true
    });
    if (!ok) return;
    setBusyId(m.userId);
    try {
      await tenantApi.removeMyMember(m.userId);
      toast.success(t('common:feedback.deleted'));
      members.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common:feedback.error'));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="page">
      <PageHeader eyebrow={t('team:eyebrow')} title={t('team:title')} description={t('team:description')} />

      <Card className="panel">
        <form className="hc-form member-add-form" onSubmit={submit}>
          <TextField
            label={t('team:fields.userId')}
            hint={t('team:fields.userIdHint')}
            error={userIdError}
            value={form.userId}
            onChange={(e) => {
              setForm((f) => ({ ...f, userId: e.target.value }));
              setUserIdError(undefined);
            }}
          />
          <p className="account-hint member-add-note">{t('team:addAsPartner')}</p>
          <div className="member-add-row member-add-row-single">
            <Button type="submit" icon={<UserPlus size={17} />} disabled={add.submitting || !form.userId.trim()}>
              {t('team:actions.add')}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="table-card">
        <div className="table-toolbar">
          <div className="table-toolbar-filters">
            <SearchInput
              placeholder={t('team:searchPlaceholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Select
              className="toolbar-filter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              placeholder={t('team:allRoles')}
              options={ALL_ROLES.map((r) => ({ value: r, label: roleLabel(t, r) }))}
            />
          </div>
          <span className="table-toolbar-count">{t('common:pagination.items', { count: total })}</span>
        </div>
        <DataState
          loading={members.loading}
          error={members.error}
          empty={total === 0}
          emptyMessage={t('team:empty')}
          onRetry={members.reload}
        >
          <div className="hc-table-scroll">
          <table className="hc-table">
            <thead>
              <tr>
                <th>{t('team:fields.userId')}</th>
                <th>{t('team:fields.roles')}</th>
                <th>{t('team:fields.status')}</th>
                <th>{t('team:fields.since')}</th>
                <th aria-label={t('common:actions.label')} />
              </tr>
            </thead>
            <tbody>
              {paged.map((m) => (
                <tr key={m.id}>
                  <td><code>{m.userId}</code></td>
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
                    <button
                      className="hc-icon-button"
                      type="button"
                      onClick={() => remove(m)}
                      disabled={busyId === m.userId}
                      aria-label={t('common:actions.delete')}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          <Pagination page={page} totalPages={totalPages} totalElements={total} onChange={setPage} />
        </DataState>
      </Card>
    </div>
  );
}
