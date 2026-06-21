export type AccountScope = 'PLATFORM' | 'TENANT';

export type HermesProfile = {
  sub?: string;
  user_id?: string;
  preferred_username?: string;
  email?: string;
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

export const SYSTEM_ADMIN_ROLE = 'SYSTEM_ADMIN';
export const GUEST_USER_ROLE = 'GUEST_USER';

export function hasRole(profile: HermesProfile | undefined, role: string): boolean {
  return profile?.roles?.includes(role) ?? false;
}

export function isSystemAdmin(profile?: HermesProfile): boolean {
  return hasRole(profile, SYSTEM_ADMIN_ROLE);
}

/**
 * Clasifica la cuenta por ACTOR (no por scope). `PLATFORM` agrupa a dos actores muy distintos:
 * el administrador del sistema y el invitado. Toda decisión de etiqueta/UI debe usar esto, no
 * `isPlatformScope` (que solo indica "sin tenant").
 */
export type ActorKind = 'system-admin' | 'guest' | 'tenant';

export function actorKind(profile?: HermesProfile): ActorKind {
  if (isSystemAdmin(profile)) {
    return 'system-admin';
  }
  return isPlatformScope(profile) ? 'guest' : 'tenant';
}

export function clearSession() {
  sessionStorage.clear();
}
