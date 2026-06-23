import { useState } from 'react';
import { Check, Copy, KeyRound, UserRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../components/PageHeader';
import { Badge, Button, Card } from '../../components/ui';
import { useAuth } from '../../hermes-security/useAuth';
import { actorKind, isTenantActor } from '../../hermes-security/sessionStore';

export function AccountPage() {
  const { t } = useTranslation(['account', 'app', 'common']);
  const { session } = useAuth();
  const profile = session?.profile;
  const kind = actorKind(profile);
  const userId = profile?.user_id ?? profile?.sub ?? '';
  const [copied, setCopied] = useState(false);

  async function copyUserId() {
    if (!userId) return;
    try {
      await navigator.clipboard.writeText(userId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* el navegador puede bloquear el portapapeles sin gesto del usuario */
    }
  }

  const roles = profile?.roles ?? [];

  return (
    <div className="page">
      <PageHeader eyebrow={t('account:eyebrow')} title={t('account:title')} description={t('account:description')} />

      <div className="page-grid-2">
        <Card className="panel">
          <div className="panel-heading">
            <UserRound size={20} />
            <h2>{t('account:profile.title')}</h2>
          </div>
          <dl className="session-details">
            <div>
              <dt>{t('account:profile.email')}</dt>
              <dd>{profile?.email ?? profile?.preferred_username ?? t('common:unavailable')}</dd>
            </div>
            <div>
              <dt>{t('account:profile.role')}</dt>
              <dd className="cell-chips">
                <Badge tone={kind === 'system-admin' ? 'accent' : kind === 'guest' ? 'warning' : 'info'}>
                  {t(`app:roles.${kind}`)}
                </Badge>
                {roles.map((r) => (
                  <Badge key={r} tone="info">{r}</Badge>
                ))}
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
          {kind === 'guest' ? <p className="account-hint">{t('account:guestHint')}</p> : null}
          {isTenantActor(kind) ? (
            <p className="account-hint">
              {t('account:workspace')}: <strong>{profile?.tenant_name ?? profile?.tenant_slug ?? '—'}</strong>
            </p>
          ) : null}
        </Card>

        <Card className="panel">
          <div className="panel-heading">
            <KeyRound size={20} />
            <h2>{t('account:password.title')}</h2>
          </div>
          <p className="placeholder-service">
            {t('common:placeholder.service')}: <code>hermes-identity-service · password</code>
          </p>
          <p className="account-hint">{t('account:password.pending')}</p>
        </Card>
      </div>
    </div>
  );
}
