import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../components/Modal';
import { Button, TextField } from '../../components/ui';
import { useMutation } from '../../hooks/useMutation';
import { useToast } from '../../components/feedback/toast';
import { identityApi } from '../../api/services';
import type { UserResponse } from '../../api/types';

type Props = {
  user: UserResponse | null;
  onClose: () => void;
  onSaved: () => void;
};

export function UserEditModal({ user, onClose, onSaved }: Props) {
  const { t } = useTranslation(['admin', 'common']);
  const toast = useToast();
  const open = user !== null;
  const [form, setForm] = useState({ username: '', email: '' });
  const save = useMutation(() => identityApi.updateUser(user!.id, { username: form.username.trim(), email: form.email.trim() }));

  const [lastId, setLastId] = useState<string | null>(null);
  if (user && user.id !== lastId) {
    setLastId(user.id);
    setForm({ username: user.username, email: user.email });
    save.reset();
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    try {
      await save.run();
      toast.success(t('common:feedback.updated'));
      onSaved();
      onClose();
    } catch {
      /* error mostrado abajo */
    }
  }

  return (
    <Modal
      open={open}
      title={t('admin:users.editTitle')}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={save.submitting}>
            {t('common:actions.cancel')}
          </Button>
          <Button type="submit" form="user-form" disabled={save.submitting}>
            {save.submitting ? t('common:actions.saving') : t('common:actions.save')}
          </Button>
        </>
      }
    >
      <form id="user-form" className="hc-form" onSubmit={submit}>
        <TextField
          label={t('admin:users.username')}
          hint={t('admin:users.usernameHint')}
          required
          value={form.username}
          onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
        />
        <TextField
          label={t('admin:users.email')}
          hint={t('admin:users.emailHint')}
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        />
        {save.error ? <p className="login-error">{save.error.message}</p> : null}
      </form>
    </Modal>
  );
}
