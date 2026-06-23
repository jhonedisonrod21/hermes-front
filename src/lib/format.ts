/** Formatea un importe con su moneda ISO. Cae a un formato simple si la moneda es inválida. */
export function formatMoney(amount: number, currency: string, locale = 'es'): string {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: currency || 'USD' }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

/** Convierte minutos a un texto legible (90 → "1 h 30 min"). */
export function formatDuration(minutes: number, hLabel = 'h', minLabel = 'min'): string {
  if (!minutes) return `0 ${minLabel}`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h && m) return `${h} ${hLabel} ${m} ${minLabel}`;
  if (h) return `${h} ${hLabel}`;
  return `${m} ${minLabel}`;
}

/** Fecha ISO → fecha local corta. */
export function formatDate(iso?: string, locale = 'es'): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date);
}
