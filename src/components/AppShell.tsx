import { useEffect, useState } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppNavBrand } from './AppNavBrand';
import { UserAccountMenu } from './UserAccountMenu';
import { PublicTopbar } from './PublicTopbar';
import { SiteFooter } from './SiteFooter';
import { OrganizationSwitcher } from './OrganizationSwitcher';
import { useAuth } from '../hermes-security/useAuth';
import { actorKind, isTenantActor } from '../hermes-security/sessionStore';
import { navigationFor } from '../app/navigation';

export function AppShell() {
  const { t } = useTranslation(['app', 'dashboard']);
  const { logout, session } = useAuth();
  const profile = session?.profile;
  const kind = actorKind(profile);
  const items = navigationFor(kind);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const location = useLocation();

  // Cierra el menú móvil al navegar.
  useEffect(() => setMobileOpen(false), [location.pathname]);

  const workspaceLabel =
    kind === 'system-admin'
      ? t('dashboard:fallback.systemAdmin')
      : kind === 'guest'
        ? t('dashboard:fallback.guest')
        : profile?.tenant_name ?? profile?.tenant_slug ?? t('dashboard:fallback.tenant');

  // El usuario invitado/cliente comparte la cara pública: sin sidebar, una sola top-bar (como la
  // landing) y sus funciones (explorar = logo, mis reservas) en el menú superior derecho.
  if (kind === 'guest') {
    return (
      <div className="public-shell">
        <PublicTopbar>
          <UserAccountMenu onLogout={logout} profile={profile} />
        </PublicTopbar>
        <main className="app-content">
          <Outlet />
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className={`app-shell ${mobileOpen ? 'app-shell-mobile-open' : ''}`.trim()}>
      <aside className="app-sidebar" aria-label={t('app:nav.ariaLabel')}>
        <div className="app-sidebar-brand">
          <AppNavBrand />
        </div>
        <nav className="app-sidebar-nav">
          {items.map((item) => {
            const Icon = item.icon;

            // Grupo desplegable (con submenú): un botón que alterna la visibilidad de sus hijos.
            // Se auto-expande cuando la ruta activa pertenece a uno de sus hijos.
            if (item.children) {
              const activeChild = item.children.some((child) => child.to && location.pathname.startsWith(child.to));
              const isOpen = openGroups[item.key] ?? activeChild;
              return (
                <div className="app-sidebar-group" key={item.key}>
                  <button
                    type="button"
                    className={`app-sidebar-link app-sidebar-group-toggle ${activeChild ? 'app-sidebar-link-active' : ''}`.trim()}
                    aria-expanded={isOpen}
                    onClick={() => setOpenGroups((groups) => ({ ...groups, [item.key]: !isOpen }))}
                  >
                    <Icon size={18} />
                    <span>{t(`app:nav.${item.key}`)}</span>
                    <ChevronDown
                      size={16}
                      className={`app-sidebar-chevron ${isOpen ? 'app-sidebar-chevron-open' : ''}`.trim()}
                      aria-hidden="true"
                    />
                  </button>
                  {isOpen ? (
                    <div className="app-sidebar-submenu">
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;
                        return (
                          <NavLink
                            key={child.to}
                            to={child.to ?? '#'}
                            className={({ isActive }) =>
                              `app-sidebar-sublink ${isActive ? 'app-sidebar-link-active' : ''}`.trim()
                            }
                          >
                            <ChildIcon size={16} />
                            <span>{t(`app:nav.${child.key}`)}</span>
                            {child.pending ? (
                              <span className="app-sidebar-pending" title={t('app:nav.pendingHint')} aria-label={t('app:nav.pendingHint')} />
                            ) : null}
                          </NavLink>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            }

            return (
              <NavLink
                key={item.to}
                to={item.to ?? '#'}
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
          {isTenantActor(kind) ? <OrganizationSwitcher /> : null}
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
