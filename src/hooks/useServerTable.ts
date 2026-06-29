import { useCallback, useEffect, useRef, useState } from 'react';
import type { Page } from '../api/http';

type Options = {
  /** Tamaño de página solicitado al servidor. */
  size?: number;
  /**
   * Clave de los filtros aplicados en el servidor (p. ej. el texto de búsqueda). Al cambiar, se
   * vuelve a la página 0 (no tiene sentido conservar la página de un resultado distinto).
   */
  resetKey?: string;
};

type ServerTable<T> = {
  items: T[];
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  totalElements: number;
  loading: boolean;
  error: Error | null;
  reload: () => void;
};

/**
 * Paginación real de servidor sobre un endpoint Spring `Page<T>`: vuelve a pedir al servidor cada vez
 * que cambia la página (o {@link Options.resetKey}, los filtros server-side). Expone los totales reales
 * del servidor, no de una ventana cargada en cliente.
 */
export function useServerTable<T>(
  loader: (params: { page: number; size: number }) => Promise<Page<T>>,
  { size = 10, resetKey = '' }: Options = {}
): ServerTable<T> {
  const [page, setPage] = useState(0);
  const [data, setData] = useState<Page<T> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [tick, setTick] = useState(0);
  const reload = useCallback(() => setTick((t) => t + 1), []);

  // El loader se recrea en cada render (captura los filtros actuales); usamos una ref para no
  // re-disparar el efecto por su identidad, solo por page/size/resetKey/tick.
  const loaderRef = useRef(loader);
  loaderRef.current = loader;
  const lastReset = useRef(resetKey);

  useEffect(() => {
    // Si cambió un filtro server-side estando en una página > 0, volvemos a la 0 sin pedir dos veces:
    // el propio cambio de página vuelve a ejecutar este efecto.
    if (lastReset.current !== resetKey && page !== 0) {
      lastReset.current = resetKey;
      setPage(0);
      return;
    }
    lastReset.current = resetKey;

    let active = true;
    setLoading(true);
    setError(null);
    loaderRef
      .current({ page, size })
      .then((res) => {
        if (active) setData(res);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, size, resetKey, tick]);

  return {
    items: data?.content ?? [],
    page,
    setPage,
    totalPages: data?.totalPages ?? 0,
    totalElements: data?.totalElements ?? 0,
    loading,
    error,
    reload
  };
}
