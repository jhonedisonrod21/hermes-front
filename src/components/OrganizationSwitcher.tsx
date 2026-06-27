import { useEffect, useId, useRef, useState } from 'react';
import { Building2, Check, ChevronDown, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useResource } from '../hooks/useResource';
import { useToast } from './feedback/toast';
import { useAuth } from '../hermes-security/useAuth';
import { authService } from '../hermes-security/authService';
import { tenantApi } from '../api/services';

/**
 * Selector de organización activa (multi-tenant). Solo aparece si el usuario pertenece
 * a 2+ organizaciones. Al cambiar, el BFF re-emite el token y recargamos para que toda
 * la app opere bajo la nueva organización. Usa un desplegable propio (no <select> nativo)
 * para mantener la estética navy + dorado.
 */
export function OrganizationSwitcher() {
  const { t } = useTranslation(['app', 'common']);
  const { session } = useAuth();
  const toast = useToast();
  const orgs = useResource(() => tenantApi.listMyOrganizations(), []);
  const [switching, setSwitching] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const listId = useId();

  const currentTenantId = session?.profile?.tenant_id ?? '';
  const items = orgs.data ?? [];

  useEffect(() => {
    if (!open) return undefined;
    function onDocPointer(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocPointer);
    return () => document.removeEventListener('mousedown', onDocPointer);
  }, [open]);

  // Sin valor que aportar: cargando, error (p. ej. sin tenant) o una sola organización.
  if (orgs.loading || orgs.error || items.length < 2) return null;

  async function change(tenantId: string) {
    setOpen(false);
    if (!tenantId || tenantId === currentTenantId || switching) return;
    setSwitching(true);
    try {
      await authService.switchTenant(tenantId);
      // El token quedó re-emitido en la sesión del BFF: recargamos bajo la nueva organización.
      window.location.assign('/');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common:feedback.error'));
      setSwitching(false);
    }
  }

  const currentName = items.find((o) => o.tenantId === currentTenantId)?.name ?? '';

  return (
    <div className="org-switcher-wrap" ref={ref}>
      <button
        type="button"
        className="org-switcher"
        title={t('app:orgSwitcher.label')}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        disabled={switching}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="org-switcher-icon" aria-hidden="true">
          {switching ? <Loader2 className="data-state-spin" size={16} /> : <Building2 size={16} />}
        </span>
        <span className="org-switcher-text">
          <span className="org-switcher-eyebrow">{t('app:orgSwitcher.label')}</span>
          <span className="org-switcher-current">{currentName}</span>
        </span>
        <ChevronDown size={15} className="org-switcher-chevron" aria-hidden="true" />
      </button>
      {open ? (
        <ul className="hc-select-menu org-switcher-menu" role="listbox" id={listId}>
          {items.map((o) => {
            const chosen = o.tenantId === currentTenantId;
            return (
              <li
                key={o.tenantId}
                role="option"
                aria-selected={chosen}
                className={`hc-select-option${chosen ? ' is-selected' : ''}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  change(o.tenantId);
                }}
              >
                <span className="hc-select-option-label">{o.name}</span>
                {chosen ? <Check size={15} className="hc-select-option-check" aria-hidden="true" /> : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
