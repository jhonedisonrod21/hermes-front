import { useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';
import { authService } from './authService';
import { AuthContext, type AuthContextValue } from './authContext';
import { onSessionExpired } from './sessionExpiry';
import type { HermesSession } from './sessionStore';
import { SessionExpiredDialog } from '../components/SessionExpiredDialog';

export function AuthProvider({ children }: Readonly<PropsWithChildren>) {
  const [session, setSession] = useState<HermesSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [expired, setExpired] = useState(false);

  // Solo mostramos el diálogo de expiración si había una sesión activa (un 401 en la carga inicial
  // es simplemente "no autenticado", que lleva a la landing/login, no a reautenticar).
  const sessionRef = useRef(session);
  sessionRef.current = session;
  useEffect(
    () =>
      onSessionExpired(() => {
        if (sessionRef.current) setExpired(true);
      }),
    []
  );

  // Al expirar la sesión, cerramos la del BFF para expirar su cookie HttpOnly (que de otro modo
  // sobrevive y reengancha el bucle de 401). Solo corre una vez: `expired` no vuelve a false.
  useEffect(() => {
    if (expired) void authService.endServerSession();
  }, [expired]);

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

  return (
    <AuthContext.Provider value={value}>
      {children}
      {expired ? <SessionExpiredDialog /> : null}
    </AuthContext.Provider>
  );
}
