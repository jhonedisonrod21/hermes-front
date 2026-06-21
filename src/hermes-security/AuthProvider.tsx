import { useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { authService } from './authService';
import { AuthContext, type AuthContextValue } from './authContext';
import type { HermesSession } from './sessionStore';

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<HermesSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    authService
      .getValidSession()
      .then((validSession) => {
        if (mounted) {
          setSession(validSession);
        }
      })
      .catch((error) => {
        // Un error del BFF (5xx/red) no es "no autenticado": no debe quedar como rechazo sin
        // capturar. Degradamos a sesión nula de forma controlada.
        console.error('Hermes session load failed', error);
        if (mounted) {
          setSession(null);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      loading,
      authenticated: Boolean(session),
      login: authService.login,
      logout: authService.logout,
      setSession
    }),
    [loading, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
