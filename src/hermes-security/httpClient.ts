import { authConfig } from './authConfig';
import { notifySessionExpired } from './sessionExpiry';

export async function hermesFetch(path: string, init: RequestInit = {}) {
  const response = await fetch(`${authConfig.apiBaseUrl}${path}`, {
    ...init,
    credentials: 'include'
  });

  if (response.status === 401) {
    // La sesión del BFF expiró durante el uso: avisamos para que el AuthProvider muestre el diálogo
    // bloqueante que obliga a reautenticarse (en vez de redirigir en duro y perder el contexto).
    notifySessionExpired();
  }

  return response;
}
