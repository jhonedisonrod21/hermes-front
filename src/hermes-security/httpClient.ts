import { authConfig } from './authConfig';

export async function hermesFetch(path: string, init: RequestInit = {}) {
  return fetch(`${authConfig.apiBaseUrl}${path}`, {
    ...init,
    credentials: 'include'
  });
}
