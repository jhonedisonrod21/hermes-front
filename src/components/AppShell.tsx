import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppNavBrand } from './AppNavBrand';
import { UserAccountMenu } from './UserAccountMenu';
import { useAuth } from '../hermes-security/useAuth';
import { actorKind } from '../hermes-security/sessionStore';
import { navigationFor } from '../app/navigation';

export function AppShell() {
  const { t } = useTranslation(['app', 'dashboard']);
  const { logout, session } = useAuth();
  const profile = session?.profile;
  const kind = actorKind(profile);
  const items = navigationFor(kind);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Cierra el menú móvil al navegar.
  useEffect(() => setMobileOpen(false), [location.pathname]);

  const workspaceLabel =
    kind === 'system-admin'
      ? t('dashboard:fallback.systemAdmin')
      : kind === 'guest'
        ? t('dashboard:fallback.guest')
        : profile?.tenant_name ?? profile?.tenant_slug ?? t('dashboard:fallback.tenant');

  return (
    <div className={`app-shell ${mobileOpen ? 'app-shell-mobile-open' : ''}`.trim()}>
      <aside className="app-sidebar" aria-label={t('app:nav.ariaLabel')}>
        <div className="app-sidebar-brand">
          <AppNavBrand />
        </div>
        <nav className="app-sidebar-nav">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `app-sidebar-link ${isActive ? 'app-sidebar-link-active' : ''}`.trim()}
              >
                <Icon size={18} />
                <span>{t(`app:nav.${item.key}`)}</span>
                {item.pending ? (
                  <span className="app-sidebar-pending" title={t('app:nav.pendingHint')} aria-label={t('app:nav.pendingHint')} />
                ) : null}
              </NavLink>
            );
          })}
        </nav>
        <div className="app-sidebar-footer">
          <span className="app-sidebar-role">{t(`app:roles.${kind}`)}</span>
          <strong>{workspaceLabel}</strong>
        </div>
      </aside>

      {mobileOpen ? <div className="app-shell-scrim" onClick={() => setMobileOpen(false)} aria-hidden="true" /> : null}

      <div className="app-main">
        <header className="app-topbar">
          <button
            className="app-topbar-toggle hc-icon-button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={t('app:nav.toggle')}
            type="button"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="app-topbar-spacer" />
          <UserAccountMenu onLogout={logout} profile={profile} />
        </header>

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
