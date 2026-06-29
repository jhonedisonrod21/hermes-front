import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hermes-security/useAuth';
import { actorKind } from '../hermes-security/sessionStore';
import { flattenNav, navigationFor } from '../app/navigation';

type PageHeaderProps = {
  /** @deprecated La miga de pan sustituyó al "eyebrow"; se mantiene por compatibilidad y no se muestra. */
  eyebrow?: string;
  title: string;
  /** Se muestra como tooltip (title) del crumb actual para no ocupar espacio vertical. */
  description?: string;
  /** Herramientas de la página (búsqueda, filtros, conteo): se alinean a la derecha junto a la miga. */
  tools?: ReactNode;
  actions?: ReactNode;
};

type Crumb = { label: string; to?: string };

/**
 * Barra superior de la página: una miga de pan compacta derivada del router (en lugar del antiguo
 * encabezado voluminoso). Los crumbs padre se enlazan según la navegación del actor; el último es la
 * página actual ({@code title}). Las acciones van a la derecha en la misma fila.
 */
export function PageHeader({ title, description, tools, actions }: PageHeaderProps) {
  const { t } = useTranslation(['app']);
  const { session } = useAuth();
  const { pathname } = useLocation();

  const navItems = flattenNav(navigationFor(actorKind(session?.profile)));
  const labelForPath = (path: string): string | null => {
    const item = navItems.find((n) => n.to === path);
    return item ? t(`app:nav.${item.key}`) : null;
  };

  const crumbs: Crumb[] = [];
  if (pathname !== '/') {
    crumbs.push({ label: t('app:nav.overview'), to: '/' });
    // Padres intermedios que existan como destino de navegación (acumulando segmentos).
    const segments = pathname.split('/').filter(Boolean);
    let acc = '';
    segments.forEach((segment, index) => {
      acc += `/${segment}`;
      if (index === segments.length - 1) return; // el último segmento es la página actual
      const label = labelForPath(acc);
      if (label) crumbs.push({ label, to: acc });
    });
  }
  crumbs.push({ label: title }); // página actual: sin enlace

  return (
    <nav className="page-bar" aria-label={t('app:breadcrumb')}>
      <ol className="breadcrumbs">
        {crumbs.map((crumb, index) => {
          const last = index === crumbs.length - 1;
          return (
            <li key={crumb.to ?? `current-${index}`} className="breadcrumb-item">
              {crumb.to && !last ? (
                <Link to={crumb.to} className="breadcrumb-link">{crumb.label}</Link>
              ) : (
                <span className="breadcrumb-current" aria-current="page" title={description}>
                  {crumb.label}
                </span>
              )}
              {!last ? <span className="breadcrumb-sep" aria-hidden="true">/</span> : null}
            </li>
          );
        })}
      </ol>
      {tools || actions ? (
        <div className="page-bar-tools">
          {tools}
          {actions ? <div className="page-bar-actions">{actions}</div> : null}
        </div>
      ) : null}
    </nav>
  );
}
