import { authConfig } from './authConfig';
import { clearSession } from './sessionStore';

export async function hermesFetch(path: string, init: RequestInit = {}) {
  const response = await fetch(`${authConfig.apiBaseUrl}${path}`, {
    ...init,
    credentials: 'include'
  });

  if (response.status === 401) {
    // La sesión del BFF expiró: limpiamos el estado local y volvemos al login.
    clearSession();
    window.location.assign('/');
  }

  return response;
}
