// Códigos ISO 4217 frecuentes (LatAm + principales). El backend valida currency contra [A-Za-z]{3}.
export const CURRENCY_CODES = [
  'COP','USD','EUR','MXN','ARS','CLP','PEN','BRL','UYU','BOB','PYG','VES','GTQ','CRC','DOP',
  'HNL','NIO','PAB','CUP','GBP','CAD','CHF','AUD','JPY','CNY','INR'
];

export type CurrencyOption = { value: string; label: string };

/** Opciones de moneda (código + nombre localizado), ordenadas por código. */
export function currencyOptions(locale: string): CurrencyOption[] {
  let display: Intl.DisplayNames | null = null;
  try {
    display = new Intl.DisplayNames([locale], { type: 'currency' });
  } catch {
    display = null;
  }
  return CURRENCY_CODES.map((code) => ({
    value: code,
    label: display ? `${code} · ${display.of(code) ?? code}` : code
  }));
}
