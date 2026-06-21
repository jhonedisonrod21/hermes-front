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

export const authService = {
  async login(username: string, password: string) {
    await createServerSession(username, password);
    window.location.assign(oauthEndpoints.bffLogin);
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

  async logout() {
    await fetch(oauthEndpoints.bffLogout, {
      method: 'POST',
      credentials: 'include'
    });
    clearSession();
    window.location.assign('/');
  }
};
