import { Activity, CalendarDays, KeyRound, Search, ShieldCheck, UserRound, UsersRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AppNavBrand } from '../components/AppNavBrand';
import { UserAccountMenu } from '../components/UserAccountMenu';
import { useAuth } from '../hermes-security/useAuth';
import { actorKind } from '../hermes-security/sessionStore';
import { Badge, Card } from '../components/ui';

export function DashboardPage() {
  const { logout, session } = useAuth();
  const { t } = useTranslation(['common', 'dashboard']);
  const profile = session?.profile;
  const userLabel = profile?.email ?? profile?.preferred_username ?? profile?.sub ?? t('dashboard:fallback.user');
  const kind = actorKind(profile);
  const isTenant = kind === 'tenant-admin' || kind === 'tenant-partner';
  const scopeLabel =
    kind === 'system-admin'
      ? t('dashboard:scope.platform')
      : kind === 'guest'
        ? t('dashboard:scope.guest')
        : t('dashboard:scope.tenant');
  const workspaceLabel =
    kind === 'system-admin'
      ? t('dashboard:fallback.systemAdmin')
      : kind === 'guest'
        ? t('dashboard:fallback.guest')
        : profile?.tenant_name ?? profile?.tenant_slug ?? t('dashboard:fallback.tenant');

  return (
    <div className="app-layout">
      <nav className="app-navbar" aria-label={t('dashboard:nav.ariaLabel')}>
        <AppNavBrand />
        <div className="app-nav-search" role="search">
          <Search size={18} />
          <input
            aria-label={t('dashboard:nav.searchAriaLabel')}
            placeholder={t('dashboard:nav.searchPlaceholder')}
            readOnly
            type="search"
          />
        </div>
        <UserAccountMenu onLogout={logout} profile={profile} />
      </nav>

      <main className="dashboard-shell">
        <header className="dashboard-hero">
          <div>
            <Badge tone="success">{t('dashboard:hero.sessionActive')}</Badge>
            <Badge tone={kind === 'system-admin' ? 'accent' : kind === 'guest' ? 'warning' : 'info'}>
              {scopeLabel}
            </Badge>
            <h1>{t('dashboard:hero.title')}</h1>
            <p>{t('dashboard:hero.description')}</p>
          </div>
          <Card className="session-card">
            <UserRound size={22} />
            <span>{userLabel}</span>
            <strong>{workspaceLabel}</strong>
          </Card>
        </header>

        <section className="summary-grid">
          <Card className="summary-card">
            <CalendarDays size={22} />
            <span>{t('dashboard:metrics.todayAppointments')}</span>
            <strong>0</strong>
          </Card>
          <Card className="summary-card">
            <UsersRound size={22} />
            <span>{t('dashboard:metrics.activeResources')}</span>
            <strong>0</strong>
          </Card>
          <Card className="summary-card">
            <ShieldCheck size={22} />
            <span>{t('dashboard:metrics.roles')}</span>
            <strong>{profile?.roles?.length ?? 0}</strong>
          </Card>
          <Card className="summary-card">
            <KeyRound size={22} />
            <span>{t('dashboard:metrics.permissions')}</span>
            <strong>{profile?.permissions?.length ?? 0}</strong>
          </Card>
        </section>

        <section className="dashboard-content-grid">
          <Card className="dashboard-panel">
            <div className="panel-heading">
              <Activity size={20} />
              <h2>{t('dashboard:authState.title')}</h2>
            </div>
            <dl className="session-details">
              <div>
                <dt>{t('dashboard:authState.user')}</dt>
                <dd>{userLabel}</dd>
              </div>
              <div>
                <dt>{t('dashboard:authState.scope')}</dt>
                <dd>{scopeLabel}</dd>
              </div>
              <div>
                <dt>{isTenant ? t('dashboard:authState.tenant') : t('dashboard:authState.workspace')}</dt>
                <dd>{isTenant ? profile?.tenant_name ?? profile?.tenant_slug ?? profile?.tenant_id ?? t('common:unavailable') : workspaceLabel}</dd>
              </div>
              <div>
                <dt>{t('dashboard:authState.subject')}</dt>
                <dd>{profile?.sub ?? profile?.user_id ?? t('common:unavailable')}</dd>
              </div>
            </dl>
          </Card>

          <Card className="token-panel">
            <h2>{t('dashboard:claims.title')}</h2>
            <pre>{JSON.stringify(profile ?? {}, null, 2)}</pre>
          </Card>
        </section>
      </main>

      <footer className="app-footer">
        <span>{t('dashboard:footer.platform')}</span>
        <span>{t('dashboard:footer.oauthLocal')}</span>
      </footer>
    </div>
  );
}
