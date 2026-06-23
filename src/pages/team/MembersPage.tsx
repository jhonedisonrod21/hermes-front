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

const ROLES = ['TENANT_ADMIN', 'TENANT_PARTNER'];

const matchMember = (m: MembershipResponse, q: string) =>
  m.userId.toLowerCase().includes(q) || m.roles.some((r) => r.toLowerCase().includes(q));

export function MembersPage() {
  const { t, i18n } = useTranslation(['team', 'common']);
  const toast = useToast();
  const confirm = useConfirm();
  const members = useResource(() => tenantApi.listMyMembers({ size: 200 }), []);
  const [form, setForm] = useState({ userId: '', role: ROLES[0] });
  const add = useMutation(() => tenantApi.addMyMember({ userId: form.userId.trim(), role: form.role }));
  const [busyId, setBusyId] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const items = members.data?.content ?? [];
  const { paged, page, setPage, totalPages, total } = useClientTable(items, {
    query,
    match: useCallback(matchMember, [])
  });

  async function submit(e: FormEvent) {
    e.preventDefault();
    try {
      await add.run();
      toast.success(t('team:toast.added'));
      setForm({ userId: '', role: ROLES[0] });
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
        <form className="hc-form member-form" onSubmit={submit}>
          <TextField
            label={t('team:fields.userId')}
            hint={t('team:fields.userIdHint')}
            required
            value={form.userId}
            onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))}
          />
          <Select
            label={t('team:fields.role')}
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            options={ROLES.map((r) => ({ value: r, label: t(`team:roles.${r}`, r) }))}
          />
          <Button type="submit" icon={<UserPlus size={17} />} disabled={add.submitting || !form.userId.trim()}>
            {t('team:actions.add')}
          </Button>
        </form>
      </Card>

      <Card className="table-card">
        <div className="table-toolbar">
          <SearchInput
            placeholder={t('team:searchPlaceholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className="table-toolbar-count">{t('common:pagination.items', { count: total })}</span>
        </div>
        <DataState
          loading={members.loading}
          error={members.error}
          empty={items.length === 0}
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
                      <Badge key={r} tone="info">{t(`team:roles.${r}`, r)}</Badge>
                    ))}
                  </td>
                  <td>
                    <Badge tone={m.status === 'ACTIVE' ? 'success' : 'warning'}>{m.status}</Badge>
                  </td>
                  <td>{formatDate(m.createdAt, i18n.language)}</td>
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
