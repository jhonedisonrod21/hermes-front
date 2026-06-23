import { useCallback, useEffect, useState } from 'react';

type ResourceState<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
  reload: () => void;
  setData: (data: T) => void;
};

/**
 * Carga un recurso asíncrono al montar y ante cambios de `deps`.
 * Evita actualizar estado si el componente se desmontó o llegó una carga más reciente.
 */
export function useResource<T>(loader: () => Promise<T>, deps: unknown[] = []): ResourceState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [tick, setTick] = useState(0);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    loader()
      .then((result) => {
        if (active) setData(result);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, ...deps]);

  return { data, loading, error, reload, setData };
}
