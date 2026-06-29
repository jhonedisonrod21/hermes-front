import { useState, type FormEvent } from 'react';
import { KeyRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/PageHeader';
import { Button, Card, TextField } from '../../components/ui';
import { ApiError } from '../../api/http';
import { useMutation } from '../../hooks/useMutation';
import { useToast } from '../../components/feedback/toast';
import { identityApi } from '../../api/services';

const MIN_PASSWORD = 8;

/** Cambio de contraseña del usuario autenticado (página independiente del perfil). */
export function ChangePasswordPage() {
  const { t } = useTranslation(['account', 'common']);
  const toast = useToast();
  const change = useMutation((body: { currentPassword: string; newPassword: string }) =>
    identityApi.changePassword(body)
  );
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!form.currentPassword) {
      toast.error(t('account:password.currentRequired'));
      return;
    }
    if (form.newPassword.length < MIN_PASSWORD) {
      toast.error(t('account:password.tooShort', { min: MIN_PASSWORD }));
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error(t('account:password.mismatch'));
      return;
    }
    try {
      await change.run({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success(t('account:password.changed'));
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      // El backend responde 400 sin detalle (no expone el motivo): mostramos un mensaje útil.
      if (err instanceof ApiError && err.status === 400) {
        toast.error(t('account:password.changeFailed'));
      } else {
        toast.error(err instanceof Error ? err.message : t('common:feedback.error'));
      }
    }
  }

  return (
    <div className="page">
      <PageHeader
        title={t('account:password.title')}
        description={t('account:password.intro')}
        actions={
          <Button
            type="submit"
            form="password-form"
            icon={<KeyRound size={16} />}
            disabled={change.submitting || !form.currentPassword || !form.newPassword}
          >
            {change.submitting ? t('common:actions.saving') : t('account:password.submit')}
          </Button>
        }
      />

      <Card className="panel">
        <p className="account-hint">{t('account:password.intro')}</p>
        <form id="password-form" className="hc-form" onSubmit={submit}>
          <TextField
            label={t('account:password.currentPassword')}
            hint={t('account:password.currentPasswordHint')}
            type="password"
            autoComplete="current-password"
            required
            value={form.currentPassword}
            onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))}
          />
          <TextField
            label={t('account:password.newPassword')}
            hint={t('account:password.newPasswordHint')}
            type="password"
            autoComplete="new-password"
            required
            value={form.newPassword}
            onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
          />
          <TextField
            label={t('account:password.confirmPassword')}
            hint={t('account:password.confirmPasswordHint')}
            type="password"
            autoComplete="new-password"
            required
            value={form.confirmPassword}
            onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
          />
        </form>
      </Card>
    </div>
  );
}
