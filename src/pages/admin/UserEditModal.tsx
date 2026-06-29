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

type FormErrors = Partial<Record<'name' | 'username' | 'email', string>>;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function UserEditModal({ user, onClose, onSaved }: Props) {
  const { t } = useTranslation(['admin', 'common']);
  const toast = useToast();
  const open = user !== null;
  const [form, setForm] = useState({ name: '', username: '', email: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const save = useMutation(() =>
    identityApi.updateUser(user!.id, { name: form.name.trim(), username: form.username.trim(), email: form.email.trim() })
  );

  const [lastId, setLastId] = useState<string | null>(null);
  if (user && user.id !== lastId) {
    setLastId(user.id);
    setForm({ name: user.name ?? '', username: user.username, email: user.email });
    setErrors({});
    save.reset();
  }

  const set = (k: 'name' | 'username' | 'email', v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = t('common:validation.required');
    if (!form.username.trim()) e.username = t('common:validation.required');
    if (!form.email.trim()) e.email = t('common:validation.required');
    else if (!EMAIL_RE.test(form.email.trim())) e.email = t('common:validation.email');
    return e;
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      toast.error(t('common:validation.fix'));
      return;
    }
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
      <form id="user-form" className="hc-form" onSubmit={submit} noValidate>
        <TextField
          label={t('admin:users.name')}
          hint={t('admin:users.nameHint')}
          value={form.name}
          error={errors.name}
          onChange={(e) => set('name', e.target.value)}
        />
        <TextField
          label={t('admin:users.username')}
          hint={t('admin:users.usernameHint')}
          value={form.username}
          error={errors.username}
          onChange={(e) => set('username', e.target.value)}
        />
        <TextField
          label={t('admin:users.email')}
          hint={t('admin:users.emailHint')}
          type="email"
          value={form.email}
          error={errors.email}
          onChange={(e) => set('email', e.target.value)}
        />
        {save.error ? <p className="login-error">{save.error.message}</p> : null}
      </form>
    </Modal>
  );
}
