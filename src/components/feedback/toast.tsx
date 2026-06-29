import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

type ToastTone = 'success' | 'error' | 'info';
type Toast = { id: number; tone: ToastTone; message: string };

type ToastApi = {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

const ToastContext = createContext<ToastApi | undefined>(undefined);

const ICONS = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info
} as const;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const remove = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (tone: ToastTone, message: string) => {
      const id = (counter.current += 1);
      setToasts((current) => [...current, { id, tone, message }]);
      window.setTimeout(() => remove(id), 4200);
    },
    [remove]
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (message) => push('success', message),
      error: (message) => push('error', message),
      info: (message) => push('info', message)
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="hc-toasts" role="region" aria-live="polite" aria-label="Notificaciones">
        {toasts.map((toast) => {
          const Icon = ICONS[toast.tone];
          return (
            <div key={toast.id} className={`hc-toast hc-toast-${toast.tone}`} role="status">
              <Icon size={22} />
              <span>{toast.message}</span>
              <button className="hc-toast-close" type="button" onClick={() => remove(toast.id)} aria-label="Cerrar">
                <X size={17} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

// El hook se coloca junto al provider a propósito (mismo dominio de feedback).
// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastApi {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider.');
  }
  return context;
}
