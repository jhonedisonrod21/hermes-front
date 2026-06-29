export type AccountScope = 'PLATFORM' | 'TENANT';

export type HermesProfile = {
  sub?: string;
  user_id?: string;
  preferred_username?: string;
  email?: string;
  name?: string;
  account_scope?: AccountScope;
  tenant_id?: string;
  tenant_slug?: string;
  tenant_name?: string;
  roles?: string[];
  permissions?: string[];
};

export type HermesSession = {
  profile?: HermesProfile;
};

/**
 * Alcance efectivo de la cuenta. Si el backend no envía `account_scope` (BFF o token
 * antiguos) se infiere: una cuenta sin tenant se trata como cuenta de plataforma.
 */
export function accountScopeOf(profile?: HermesProfile): AccountScope {
  if (profile?.account_scope) {
    return profile.account_scope;
  }
  return profile?.tenant_id ? 'TENANT' : 'PLATFORM';
}

/** El administrador del sistema (y cualquier cuenta de plataforma) no pertenece a un tenant. */
export function isPlatformScope(profile?: HermesProfile): boolean {
  return accountScopeOf(profile) === 'PLATFORM';
}

// Roles del modelo de 4 actores de Hermes (coinciden con los nombres del JWT y del gateway).
export const SYSTEM_ADMIN_ROLE = 'SYSTEM_ADMIN';
export const TENANT_ADMIN_ROLE = 'TENANT_ADMIN';
export const TENANT_PARTNER_ROLE = 'TENANT_PARTNER';
export const GUEST_USER_ROLE = 'GUEST_USER';

export function hasRole(profile: HermesProfile | undefined, role: string): boolean {
  return profile?.roles?.includes(role) ?? false;
}

export function isSystemAdmin(profile?: HermesProfile): boolean {
  return hasRole(profile, SYSTEM_ADMIN_ROLE);
}

/**
 * Clasifica la cuenta por ACTOR (no por scope), segun el modelo de 4 actores:
 * - `system-admin`: administrador de plataforma (rol SYSTEM_ADMIN).
 * - `tenant-admin`: administra la organizacion (catalogo, agenda, reportes, equipo).
 * - `tenant-partner`: opera la agenda (citas) dentro de una organizacion.
 * - `guest`: invitado sin organizacion (busca, reserva, paga).
 */
export type ActorKind = 'system-admin' | 'tenant-admin' | 'tenant-partner' | 'guest';

export function actorKind(profile?: HermesProfile): ActorKind {
  if (isSystemAdmin(profile)) {
    return 'system-admin';
  }
  if (hasRole(profile, TENANT_ADMIN_ROLE)) {
    return 'tenant-admin';
  }
  if (hasRole(profile, TENANT_PARTNER_ROLE)) {
    return 'tenant-partner';
  }
  return 'guest';
}

/** Verdadero para los actores que pertenecen a una organizacion (admin o partner). */
export function isTenantActor(kind: ActorKind): boolean {
  return kind === 'tenant-admin' || kind === 'tenant-partner';
}

export function clearSession() {
  sessionStorage.clear();
}
