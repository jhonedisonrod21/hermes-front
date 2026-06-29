import { oauthEndpoints } from './authConfig';
import { i18n } from '../i18n';
import { clearSession, type AccountScope, type HermesProfile, type HermesSession } from './sessionStore';

type BffSessionUser = {
  authenticated?: boolean;
  sub?: string;
  userId?: string;
  preferredUsername?: string;
  email?: string;
  accountScope?: string;
  tenantId?: string;
  tenantSlug?: string;
  tenantName?: string;
  roles?: string[];
  permissions?: string[];
  claims?: Record<string, unknown>;
};

function resolveAccountScope(user: BffSessionUser): AccountScope {
  const candidate = user.accountScope ?? user.claims?.['account_scope'];
  if (candidate === 'PLATFORM' || candidate === 'TENANT') {
    return candidate;
  }
  // Sin alcance explícito: una cuenta sin tenant es cuenta de plataforma (p. ej. SYSTEM_ADMIN).
  return user.tenantId ? 'TENANT' : 'PLATFORM';
}

function toSession(user: BffSessionUser): HermesSession {
  const profile: HermesProfile = {
    sub: user.sub,
    user_id: user.userId,
    preferred_username: user.preferredUsername,
    email: user.email,
    name: typeof user.claims?.['name'] === 'string' ? user.claims['name'] : undefined,
    account_scope: resolveAccountScope(user),
    tenant_id: user.tenantId,
    tenant_slug: user.tenantSlug,
    tenant_name: user.tenantName,
    roles: user.roles,
    permissions: user.permissions
  };

  return { profile };
}

async function createServerSession(username: string, password: string) {
  const response = await fetch(oauthEndpoints.sessionLogin, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password }),
    credentials: 'include'
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `${i18n.t('auth:errors.sessionLoginFailed')} (${response.status})`);
  }
}

export type RegistrationResult = { userId: string; email: string; role: string };

async function registerUser(name: string, email: string, password: string): Promise<RegistrationResult> {
  const response = await fetch(oauthEndpoints.register, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });

  if (!response.ok) {
    const detail = await response.text();
    if (response.status === 409) {
      throw new Error(i18n.t('auth:register.errors.emailTaken'));
    }
    throw new Error(detail || `${i18n.t('auth:register.errors.failed')} (${response.status})`);
  }

  return (await response.json()) as RegistrationResult;
}

export const authService = {
  async login(username: string, password: string) {
    await createServerSession(username, password);
    globalThis.location.assign(oauthEndpoints.bffLogin);
  },

  async register(name: string, email: string, password: string) {
    return registerUser(name, email, password);
  },

  /** Solicita un código de restablecimiento al correo (público, sin sesión). */
  async requestPasswordReset(email: string): Promise<void> {
    const response = await fetch(oauthEndpoints.passwordResetRequest, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (!response.ok) {
      throw new Error((await response.text()) || `${response.status}`);
    }
  },

  /** Confirma el restablecimiento con el código recibido y la nueva contraseña (público). */
  async confirmPasswordReset(token: string, newPassword: string): Promise<void> {
    const response = await fetch(oauthEndpoints.passwordResetConfirm, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword })
    });
    if (!response.ok) {
      throw new Error((await response.text()) || `${response.status}`);
    }
  },

  async getValidSession(): Promise<HermesSession | null> {
    const response = await fetch(oauthEndpoints.bffSession, {
      credentials: 'include'
    });

    if (response.status === 401) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`${i18n.t('auth:errors.sessionLoadFailed')} (${response.status})`);
    }

    const user = (await response.json()) as BffSessionUser;
    return user.authenticated === false ? null : toSession(user);
  },

  /** Cambia la organización activa: el BFF re-emite y reemplaza el token; devuelve la sesión actualizada. */
  async switchTenant(tenantId: string): Promise<HermesSession> {
    const response = await fetch(oauthEndpoints.bffSwitchTenant, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId }),
      credentials: 'include'
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(detail || `No se pudo cambiar de organización (${response.status})`);
    }

    return toSession((await response.json()) as BffSessionUser);
  },

  async logout() {
    await fetch(oauthEndpoints.bffLogout, {
      method: 'POST',
      credentials: 'include'
    });
    clearSession();
    globalThis.location.assign('/');
  },

  /**
   * Invalida la sesión del BFF (expira su cookie HttpOnly) sin navegar. Se usa al detectar una sesión
   * expirada: el access token caducó y no se pudo refrescar, pero la WebSession del BFF sigue viva; si
   * no la cerramos, su cookie sobrevive y vuelve a "autenticar" al recargar, reenganchando el bucle de
   * 401. Tolerante a fallos: si el logout no responde, igual seguimos con la limpieza local.
   */
  async endServerSession(): Promise<void> {
    try {
      await fetch(oauthEndpoints.bffLogout, { method: 'POST', credentials: 'include' });
    } catch {
      /* red/servidor caído: la reautenticación posterior fuerza de todos modos un flujo limpio */
    }
  }
};
