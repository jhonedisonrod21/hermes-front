import { useMemo, useState, type FormEvent } from 'react';
import { Trash2, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../components/Modal';
import { DataState } from '../../components/DataState';
import { Badge, Button, Combobox, Select } from '../../components/ui';
import { useResource } from '../../hooks/useResource';
import { useMutation } from '../../hooks/useMutation';
import { useToast } from '../../components/feedback/toast';
import { useConfirm } from '../../components/feedback/confirm';
import { identityApi, tenantApi } from '../../api/services';
import type { TenantResponse, UserResponse } from '../../api/types';

const ROLES = ['TENANT_ADMIN', 'TENANT_PARTNER'];

type Props = {
  tenant: TenantResponse | null;
  onClose: () => void;
};

export function TenantMembersModal({ tenant, onClose }: Props) {
  const { t } = useTranslation(['admin', 'team', 'common']);
  const toast = useToast();
  const confirm = useConfirm();
  const open = tenant !== null;
  const members = useResource(
    () => (tenant ? tenantApi.listTenantMembers(tenant.id, { size: 100 }) : Promise.resolve(null)),
    [tenant?.id]
  );
  // Solo el SYSTEM_ADMIN abre este modal y puede listar usuarios de identidad.
  const users = useResource(
    () => (tenant ? identityApi.listUsers({ size: 200, sort: 'username,asc' }) : Promise.resolve(null)),
    [tenant?.id]
  );
  const [form, setForm] = useState({ userId: '', role: ROLES[0] });
  const add = useMutation(() => tenantApi.addTenantMember(tenant!.id, { userId: form.userId, role: form.role }));
  const [busyId, setBusyId] = useState<string | null>(null);

  const items = members.data?.content ?? [];
  const allUsers = useMemo(() => users.data?.content ?? [], [users.data]);
  const usersById = useMemo(() => new Map(allUsers.map((u) => [u.id, u])), [allUsers]);

  // Excluye usuarios que ya son miembros del tenant.
  const memberIds = useMemo(() => new Set(items.map((m) => m.userId)), [items]);
  const userOptions = useMemo(
    () =>
      allUsers
        .filter((u) => !memberIds.has(u.id))
        .map((u: UserResponse) => ({ value: u.id, label: u.username, sublabel: u.email })),
    [allUsers, memberIds]
  );

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!tenant || !form.userId) return;
    try {
      await add.run();
      toast.success(t('team:toast.added'));
      setForm({ userId: '', role: ROLES[0] });
      members.reload();
    } catch {
      /* error mostrado abajo */
    }
  }

  async function remove(userId: string) {
    if (!tenant) return;
    const ok = await confirm({
      title: t('team:confirm.removeTitle'),
      message: t('team:confirm.removeMessage', { id: usersById.get(userId)?.username ?? userId }),
      confirmLabel: t('common:actions.delete'),
      danger: true
    });
    if (!ok) return;
    setBusyId(userId);
    try {
      await tenantApi.removeTenantMember(tenant.id, userId);
      toast.success(t('common:feedback.deleted'));
      members.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common:feedback.error'));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Modal open={open} title={t('admin:members.title', { name: tenant?.name ?? '' })} onClose={onClose}>
      <form className="hc-form member-form" onSubmit={submit}>
        <Combobox
          label={t('admin:members.pickUser')}
          value={form.userId}
          onChange={(userId) => setForm((f) => ({ ...f, userId }))}
          options={userOptions}
          placeholder={t('admin:members.pickPlaceholder')}
          hint={users.loading ? t('common:dataState.loading') : t('admin:members.pickHint')}
          emptyText={t('admin:members.searchEmpty')}
          clearLabel={t('admin:members.clear')}
        />
        <Select
          label={t('team:fields.role')}
          value={form.role}
          onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
          options={ROLES.map((r) => ({ value: r, label: t(`admin:members.roles.${r}`, r) }))}
        />
        <Button type="submit" icon={<UserPlus size={17} />} disabled={add.submitting || !form.userId}>
          {t('team:actions.add')}
        </Button>
      </form>
      {add.error ? <p className="login-error">{add.error.message}</p> : null}

      <div className="members-modal-list">
        <DataState
          loading={members.loading}
          error={members.error}
          empty={items.length === 0}
          emptyMessage={t('admin:members.empty')}
          onRetry={members.reload}
        >
          <ul className="exception-list">
            {items.map((m) => {
              const user = usersById.get(m.userId);
              return (
                <li key={m.id}>
                  <div>
                    {user ? (
                      <span className="member-identity">
                        <strong>{user.username}</strong>
                        <span>{user.email}</span>
                      </span>
                    ) : (
                      <code>{m.userId}</code>
                    )}
                    {m.roles.map((r) => (
                      <Badge key={r} tone="info">{t(`admin:members.roles.${r}`, r)}</Badge>
                    ))}
                    <Badge tone={m.status === 'ACTIVE' ? 'success' : 'warning'}>{m.status}</Badge>
                  </div>
                  <button
                    className="hc-icon-button"
                    type="button"
                    onClick={() => remove(m.userId)}
                    disabled={busyId === m.userId}
                    aria-label={t('common:actions.delete')}
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              );
            })}
          </ul>
        </DataState>
      </div>
    </Modal>
  );
}
