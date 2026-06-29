/**
 * Canal mínimo de "sesión expirada": la capa HTTP (no-React) avisa y el AuthProvider (React) reacciona
 * mostrando el diálogo bloqueante. Evita acoplar `httpClient` al estado de React.
 */
type Listener = () => void;

const listeners = new Set<Listener>();

/** Suscribe un listener; devuelve la función para desuscribirlo. */
export function onSessionExpired(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Notifica que la sesión expiró (p. ej. una llamada autenticada devolvió 401). */
export function notifySessionExpired(): void {
  for (const listener of listeners) {
    listener();
  }
}
