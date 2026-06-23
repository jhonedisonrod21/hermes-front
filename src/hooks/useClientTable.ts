import { useEffect, useMemo, useState } from 'react';

type Options<T> = {
  pageSize?: number;
  query: string;
  /** Predicado de coincidencia para el texto de búsqueda (ya en minúsculas). */
  match: (item: T, q: string) => boolean;
  /** Clave de los filtros externos (estado/rol/etc.): al cambiar, vuelve a la página 1. */
  resetKey?: string;
};

type ClientTable<T> = {
  paged: T[];
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  total: number;
};

/**
 * Búsqueda y paginación en el cliente sobre una lista ya cargada. Útil cuando el endpoint
 * no ofrece filtro `q`: se carga una ventana del servidor y se filtra/pagina localmente.
 */
export function useClientTable<T>(
  items: T[],
  { pageSize = 8, query, match, resetKey }: Options<T>
): ClientTable<T> {
  const [page, setPage] = useState(0);
  const normalized = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!normalized) return items;
    return items.filter((item) => match(item, normalized));
  }, [items, normalized, match]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  // Si cambia el filtro o se encoge la lista, no nos quedamos en una página inexistente.
  useEffect(() => {
    setPage((current) => Math.min(current, totalPages - 1));
  }, [totalPages]);
  // Vuelve a la primera página al cambiar el texto de búsqueda o cualquier filtro externo.
  useEffect(() => {
    setPage(0);
  }, [normalized, resetKey]);

  const paged = useMemo(() => filtered.slice(page * pageSize, page * pageSize + pageSize), [filtered, page, pageSize]);

  return { paged, page, setPage, totalPages, total: filtered.length };
}
