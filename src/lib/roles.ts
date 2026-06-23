/** Convierte un rol técnico (p. ej. GUEST_USER) en texto legible, como respaldo. */
function humanizeRole(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\p{L}/gu, (c) => c.toUpperCase());
}

/**
 * Etiqueta amigable y localizada de un rol del backend.
 * Nunca expone el identificador crudo: si no hay traducción, lo humaniza
 * (GUEST_USER -> "Guest User") en vez de mostrar el código técnico.
 */
export function roleLabel(
  t: (key: string, options?: { defaultValue?: string }) => string,
  raw: string
): string {
  return t(`common:roleNames.${raw}`, { defaultValue: humanizeRole(raw) });
}
