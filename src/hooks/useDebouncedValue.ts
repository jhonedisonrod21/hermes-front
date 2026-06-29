import { useEffect, useState } from 'react';

/** Devuelve `value` con retardo: útil para no disparar una búsqueda server-side en cada tecla. */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}
