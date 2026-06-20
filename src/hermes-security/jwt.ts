import type { HermesProfile } from './sessionStore';

export function decodeJwtPayload(token?: string): HermesProfile | undefined {
  if (!token) {
    return undefined;
  }

  const [, payload] = token.split('.');
  if (!payload) {
    return undefined;
  }

  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(normalized)
        .split('')
        .map((character) => `%${`00${character.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    );
    return JSON.parse(json) as HermesProfile;
  } catch {
    return undefined;
  }
}
