import { useState } from 'react';
import { Building2, ChevronDown, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useResource } from '../hooks/useResource';
import { useToast } from './feedback/toast';
import { useAuth } from '../hermes-security/useAuth';
import { authService } from '../hermes-security/authService';
import { tenantApi } from '../api/services';

/**
 * Selector de organización activa (multi-tenant). Solo aparece si el usuario pertenece
 * a 2+ organizaciones. Al cambiar, el BFF re-emite el token y recargamos para que toda
 * la app opere bajo la nueva organización.
 */
export function OrganizationSwitcher() {
  const { t } = useTranslation(['app', 'common']);
  const { session } = useAuth();
  const toast = useToast();
  const orgs = useResource(() => tenantApi.listMyOrganizations(), []);
  const [switching, setSwitching] = useState(false);

  const currentTenantId = session?.profile?.tenant_id ?? '';
  const items = orgs.data ?? [];

  // Sin valor que aportar: cargando, error (p. ej. sin tenant) o una sola organización.
  if (orgs.loading || orgs.error || items.length < 2) return null;

  async function onChange(tenantId: string) {
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

  return (
    <label className="org-switcher" title={t('app:orgSwitcher.label')}>
      <span className="org-switcher-icon" aria-hidden="true">
        {switching ? <Loader2 className="data-state-spin" size={16} /> : <Building2 size={16} />}
      </span>
      <span className="org-switcher-text">
        <span className="org-switcher-eyebrow">{t('app:orgSwitcher.label')}</span>
        <select
          aria-label={t('app:orgSwitcher.label')}
          value={currentTenantId}
          disabled={switching}
          onChange={(e) => onChange(e.target.value)}
        >
          {items.map((o) => (
            <option key={o.tenantId} value={o.tenantId}>
              {o.name}
            </option>
          ))}
        </select>
      </span>
      <ChevronDown size={15} className="org-switcher-chevron" aria-hidden="true" />
    </label>
  );
}
