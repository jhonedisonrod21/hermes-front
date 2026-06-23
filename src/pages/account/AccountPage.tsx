import { useEffect, useState, type FormEvent } from 'react';
import { Check, Copy, KeyRound, Save, Send, UserRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/PageHeader';
import { DataState } from '../../components/DataState';
import { Badge, Button, Card, TextField } from '../../components/ui';
import { useResource } from '../../hooks/useResource';
import { useMutation } from '../../hooks/useMutation';
import { useToast } from '../../components/feedback/toast';
import { useAuth } from '../../hermes-security/useAuth';
import { actorKind, isTenantActor } from '../../hermes-security/sessionStore';
import { identityApi } from '../../api/services';

const MIN_PASSWORD = 8;

export function AccountPage() {
  const { t } = useTranslation(['account', 'app', 'common']);
  const toast = useToast();
  const { session } = useAuth();
  const sessionProfile = session?.profile;
  const kind = actorKind(sessionProfile);

  const me = useResource(() => identityApi.getMyProfile(), []);
  const [phone, setPhone] = useState('');
  const savePhone = useMutation((value: string) => identityApi.updateMyProfile({ phone: value.trim() || undefined }));
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (me.data) setPhone(me.data.phone ?? '');
  }, [me.data]);

  const userId = me.data?.id ?? sessionProfile?.user_id ?? sessionProfile?.sub ?? '';
  const email = me.data?.email ?? sessionProfile?.email ?? t('common:unavailable');

  async function copyUserId() {
    if (!userId) return;
    try {
      await navigator.clipboard.writeText(userId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // El portapapeles puede requerir gesto/permiso: avisamos en vez de fallar en silencio.
      toast.error(t('account:profile.copyFailed'));
    }
  }

  async function submitPhone(e: FormEvent) {
    e.preventDefault();
    try {
      await savePhone.run(phone);
      toast.success(t('account:profile.saved'));
      me.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common:feedback.error'));
    }
  }

  return (
    <div className="page">
      <PageHeader eyebrow={t('account:eyebrow')} title={t('account:title')} description={t('account:description')} />

      <div className="page-grid-2">
        <Card className="panel">
          <div className="panel-heading">
            <UserRound size={20} />
            <h2>{t('account:profile.title')}</h2>
          </div>
          <DataState loading={me.loading} error={me.error} onRetry={me.reload}>
            <dl className="session-details">
              <div>
                <dt>{t('account:profile.email')}</dt>
                <dd>{email}</dd>
              </div>
              <div>
                <dt>{t('account:profile.role')}</dt>
                <dd className="cell-chips">
                  <Badge tone={kind === 'system-admin' ? 'accent' : kind === 'guest' ? 'warning' : 'info'}>
                    {t(`app:roles.${kind}`)}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt>{t('account:profile.userId')}</dt>
                <dd className="account-userid">
                  <code>{userId || t('common:unavailable')}</code>
                  {userId ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={copied ? <Check size={15} /> : <Copy size={15} />}
                      onClick={copyUserId}
                    >
                      {copied ? t('account:profile.copied') : t('account:profile.copy')}
                    </Button>
                  ) : null}
                </dd>
              </div>
            </dl>

            <form className="hc-form account-phone-form" onSubmit={submitPhone}>
              <TextField
                label={t('account:profile.phone')}
                type="tel"
                hint={t('account:profile.phoneHint')}
                placeholder="+57 300 000 0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <div className="panel-actions">
                <Button type="submit" size="sm" icon={<Save size={16} />} disabled={savePhone.submitting}>
                  {savePhone.submitting ? t('common:actions.saving') : t('common:actions.save')}
                </Button>
              </div>
            </form>

            {kind === 'guest' ? (
              <div className="account-guest-note">
                <p className="account-hint">{t('account:guest.clientNote')}</p>
                <details className="account-disclosure">
                  <summary>{t('account:guest.staffQuestion')}</summary>
                  <p className="account-hint">{t('account:guest.staffHint')}</p>
                </details>
              </div>
            ) : null}
            {isTenantActor(kind) ? (
              <p className="account-hint">
                {t('account:workspace')}: <strong>{sessionProfile?.tenant_name ?? sessionProfile?.tenant_slug ?? '—'}</strong>
              </p>
            ) : null}
          </DataState>
        </Card>

        <PasswordCard email={me.data?.email ?? sessionProfile?.email ?? ''} />
      </div>
    </div>
  );
}

function PasswordCard({ email }: { email: string }) {
  const { t } = useTranslation(['account', 'common']);
  const toast = useToast();
  const request = useMutation(() => identityApi.requestPasswordReset({ email }));
  const confirm = useMutation((body: { token: string; newPassword: string }) =>
    identityApi.confirmPasswordReset(body)
  );
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ token: '', newPassword: '', confirmPassword: '' });

  async function sendCode() {
    if (!email) return;
    try {
      await request.run();
      setSent(true);
      toast.success(t('account:password.requestSent'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common:feedback.error'));
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (form.newPassword.length < MIN_PASSWORD) {
      toast.error(t('account:password.tooShort', { min: MIN_PASSWORD }));
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error(t('account:password.mismatch'));
      return;
    }
    try {
      await confirm.run({ token: form.token.trim(), newPassword: form.newPassword });
      toast.success(t('account:password.changed'));
      setForm({ token: '', newPassword: '', confirmPassword: '' });
      setSent(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common:feedback.error'));
    }
  }

  return (
    <Card className="panel">
      <div className="panel-heading">
        <KeyRound size={20} />
        <h2>{t('account:password.title')}</h2>
      </div>
      <p className="account-hint">{t('account:password.intro')}</p>
      <Button variant="secondary" size="sm" icon={<Send size={16} />} disabled={request.submitting || !email} onClick={sendCode}>
        {request.submitting ? t('account:password.sending') : sent ? t('account:password.resend') : t('account:password.request')}
      </Button>

      <form className="hc-form account-pass-form" onSubmit={submit}>
        <TextField
          label={t('account:password.token')}
          hint={t('account:password.tokenHint')}
          required
          value={form.token}
          onChange={(e) => setForm((f) => ({ ...f, token: e.target.value }))}
        />
        <div className="hc-form-row">
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
        </div>
        <div className="panel-actions">
          <Button type="submit" size="sm" disabled={confirm.submitting || !form.token.trim()}>
            {confirm.submitting ? t('common:actions.saving') : t('account:password.submit')}
          </Button>
        </div>
      </form>
    </Card>
  );
}
