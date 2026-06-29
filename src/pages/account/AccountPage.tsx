import { useEffect, useState, type FormEvent } from 'react';
import { Save, UserRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/PageHeader';
import { DataState } from '../../components/DataState';
import { Badge, Button, Card, TextField } from '../../components/ui';
import { useResource } from '../../hooks/useResource';
import { useMutation } from '../../hooks/useMutation';
import { useToast } from '../../components/feedback/toast';
import { useAuth } from '../../hermes-security/useAuth';
import { actorKind } from '../../hermes-security/sessionStore';
import { identityApi } from '../../api/services';

/** Perfil del usuario autenticado (el cambio de contraseña vive en su propia página). */
export function AccountPage() {
  const { t } = useTranslation(['account', 'app', 'dashboard', 'common']);
  const toast = useToast();
  const { session } = useAuth();
  const sessionProfile = session?.profile;
  const kind = actorKind(sessionProfile);

  const me = useResource(() => identityApi.getMyProfile(), []);
  const [phone, setPhone] = useState('');
  const savePhone = useMutation((value: string) => identityApi.updateMyProfile({ phone: value.trim() || undefined }));

  useEffect(() => {
    if (me.data) setPhone(me.data.phone ?? '');
  }, [me.data]);

  const email = me.data?.email ?? sessionProfile?.email ?? t('common:unavailable');
  const name = me.data?.name ?? sessionProfile?.name ?? '';
  // Organización a la que pertenece el usuario (o su contexto si no es de un tenant).
  const workspace =
    kind === 'system-admin'
      ? t('dashboard:fallback.systemAdmin')
      : kind === 'guest'
        ? t('dashboard:fallback.guest')
        : sessionProfile?.tenant_name ?? sessionProfile?.tenant_slug ?? t('dashboard:fallback.tenant');
  const roleTone = kind === 'system-admin' ? 'accent' : kind === 'guest' ? 'warning' : 'info';

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
      <PageHeader
        eyebrow={t('account:eyebrow')}
        title={t('account:title')}
        description={t('account:description')}
        actions={
          <Button type="submit" form="profile-form" icon={<Save size={17} />} disabled={savePhone.submitting || me.loading}>
            {savePhone.submitting ? t('common:actions.saving') : t('common:actions.save')}
          </Button>
        }
      />

      <Card className="panel">
        <DataState loading={me.loading} error={me.error} onRetry={me.reload}>
          <div className="org-summary account-card">
            <span className="org-summary-mark"><UserRound size={24} /></span>
            <div className="account-card-body">
              <strong>{name || email}</strong>
              {name ? <span className="org-slug">{email}</span> : null}
              <div className="account-card-info">
                <span className="org-slug">{workspace}</span>
                <Badge tone={roleTone}>{t(`app:roles.${kind}`)}</Badge>
              </div>
            </div>
          </div>

          <form id="profile-form" className="hc-form account-phone-form" onSubmit={submitPhone}>
            <TextField
              label={t('account:profile.phone')}
              type="tel"
              hint={t('account:profile.phoneHint')}
              placeholder="+57 300 000 0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
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
        </DataState>
      </Card>
    </div>
  );
}
