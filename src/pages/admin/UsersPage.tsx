import { useCallback, useMemo, useState } from 'react';
import { Lock, Pencil, Unlock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/PageHeader';
import { DataState } from '../../components/DataState';
import { Badge, Button, Card, Pagination, SearchInput, Select } from '../../components/ui';
import { UserEditModal } from './UserEditModal';
import { useResource } from '../../hooks/useResource';
import { useClientTable } from '../../hooks/useClientTable';
import { useToast } from '../../components/feedback/toast';
import { useConfirm } from '../../components/feedback/confirm';
import { identityApi } from '../../api/services';
import type { UserResponse } from '../../api/types';
import { formatDate } from '../../lib/format';

const matchUser = (u: UserResponse, q: string) =>
  u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);

export function UsersPage() {
  const { t, i18n } = useTranslation(['admin', 'common']);
  const toast = useToast();
  const confirm = useConfirm();
  const users = useResource(() => identityApi.listUsers({ size: 200, sort: 'createdAt,desc' }), []);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editing, setEditing] = useState<UserResponse | null>(null);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const items = useMemo(() => users.data?.content ?? [], [users.data]);
  const availableRoles = useMemo(
    () => Array.from(new Set(items.flatMap((u) => u.roles ?? []))).sort(),
    [items]
  );
  const visible = useMemo(
    () =>
      items
        .filter((u) => (roleFilter ? (u.roles ?? []).includes(roleFilter) : true))
        .filter((u) => {
          if (!statusFilter) return true;
          if (statusFilter === 'active') return u.enabled && !u.locked;
          if (statusFilter === 'locked') return u.locked;
          if (statusFilter === 'disabled') return !u.enabled && !u.locked;
          return true;
        }),
    [items, roleFilter, statusFilter]
  );
  const { paged, page, setPage, totalPages, total } = useClientTable(visible, {
    query,
    match: useCallback(matchUser, [])
  });

  async function toggleLock(u: UserResponse) {
    if (!u.locked) {
      const ok = await confirm({
        title: t('admin:users.confirm.lockTitle'),
        message: t('admin:users.confirm.lockMessage', { name: u.username }),
        confirmLabel: t('admin:users.lock'),
        danger: true
      });
      if (!ok) return;
    }
    setBusyId(u.id);
    try {
      await identityApi.setLock(u.id, { locked: !u.locked });
      toast.success(u.locked ? t('admin:users.toast.unlocked') : t('admin:users.toast.locked'));
      users.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common:feedback.error'));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="page">
      <PageHeader eyebrow={t('admin:users.eyebrow')} title={t('admin:users.title')} description={t('admin:users.description')} />

      <Card className="table-card">
        <div className="table-toolbar">
          <div className="table-toolbar-filters">
            <SearchInput
              placeholder={t('admin:users.searchPlaceholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Select
              className="toolbar-filter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              placeholder={t('admin:users.allRoles')}
              options={availableRoles.map((r) => ({ value: r, label: r }))}
            />
            <Select
              className="toolbar-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              placeholder={t('admin:users.allStatus')}
              options={[
                { value: 'active', label: t('admin:users.active') },
                { value: 'locked', label: t('admin:users.locked') },
                { value: 'disabled', label: t('admin:users.disabled') }
              ]}
            />
          </div>
          <span className="table-toolbar-count">{t('common:pagination.items', { count: total })}</span>
        </div>
        <DataState
          loading={users.loading}
          error={users.error}
          empty={items.length === 0}
          emptyMessage={t('admin:users.empty')}
          onRetry={users.reload}
        >
          <div className="hc-table-scroll">
          <table className="hc-table">
            <thead>
              <tr>
                <th>{t('admin:users.username')}</th>
                <th>{t('admin:users.email')}</th>
                <th>{t('admin:users.roles')}</th>
                <th>{t('admin:users.status')}</th>
                <th>{t('admin:users.created')}</th>
                <th aria-label={t('common:actions.label')} />
              </tr>
            </thead>
            <tbody>
              {paged.map((u) => (
                <tr key={u.id}>
                  <td><strong>{u.username}</strong></td>
                  <td>{u.email}</td>
                  <td className="cell-chips">
                    {(u.roles ?? []).map((r) => (
                      <Badge key={r} tone="info">{r}</Badge>
                    ))}
                  </td>
                  <td>
                    <Badge tone={u.locked ? 'danger' : u.enabled ? 'success' : 'warning'}>
                      {u.locked ? t('admin:users.locked') : u.enabled ? t('admin:users.active') : t('admin:users.disabled')}
                    </Badge>
                  </td>
                  <td>{formatDate(u.createdAt, i18n.language)}</td>
                  <td className="row-actions">
                    <Button variant="ghost" size="sm" icon={<Pencil size={15} />} onClick={() => setEditing(u)}>
                      {t('common:actions.edit')}
                    </Button>
                    <Button
                      variant={u.locked ? 'secondary' : 'danger'}
                      size="sm"
                      icon={u.locked ? <Unlock size={15} /> : <Lock size={15} />}
                      disabled={busyId === u.id}
                      onClick={() => toggleLock(u)}
                    >
                      {u.locked ? t('admin:users.unlock') : t('admin:users.lock')}
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

      <UserEditModal user={editing} onClose={() => setEditing(null)} onSaved={() => users.reload()} />
    </div>
  );
}
