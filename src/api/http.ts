import { hermesFetch } from '../hermes-security/httpClient';

/** Error HTTP enriquecido con el status y, si vino, el cuerpo del backend. */
export class ApiError extends Error {
  readonly status: number;
  readonly body?: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

type QueryValue = string | number | boolean | undefined | null;

/** Construye un querystring omitiendo valores vacíos. Soporta arrays (sort, etc.). */
export function buildQuery(params: Record<string, QueryValue | QueryValue[]>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      value.filter((v) => v !== undefined && v !== null && v !== '').forEach((v) => search.append(key, String(v)));
    } else {
      search.append(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

/** Extrae mensajes de errores de validación de Spring (array `errors`) si el cuerpo los trae. */
function fieldErrorsOf(body: Record<string, unknown>): string | null {
  const errors = body.errors ?? body.fieldErrors;
  if (Array.isArray(errors) && errors.length > 0) {
    const messages = errors
      .map((e) => {
        if (typeof e === 'string') return e;
        const item = e as Record<string, unknown>;
        const field = item.field ?? item.objectName;
        const msg = item.defaultMessage ?? item.message ?? item.reason;
        if (typeof msg === 'string') return field ? `${field}: ${msg}` : msg;
        return null;
      })
      .filter((m): m is string => Boolean(m));
    if (messages.length > 0) return messages.join(' · ');
  }
  return null;
}

async function parseError(response: Response): Promise<ApiError> {
  let body: unknown;
  let message = `${response.status} ${response.statusText}`;
  try {
    const text = await response.text();
    if (text) {
      try {
        body = JSON.parse(text);
        const record = body as Record<string, unknown>;
        const fieldErrors = fieldErrorsOf(record);
        const detail = record?.message ?? record?.detail ?? record?.error;
        if (fieldErrors) message = fieldErrors;
        else if (typeof detail === 'string' && detail.trim()) message = detail;
      } catch {
        body = text;
        if (text.trim()) message = text;
      }
    }
  } catch {
    /* sin cuerpo */
  }
  return new ApiError(response.status, message, body);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await hermesFetch(path, init);
  if (!response.ok) {
    throw await parseError(response);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

/** Trae un archivo binario (p. ej. PDF) como Blob, para previsualizarlo o descargarlo. */
export async function fetchBlob(path: string): Promise<Blob> {
  const response = await hermesFetch(path, {});
  if (!response.ok) {
    throw await parseError(response);
  }
  return response.blob();
}

/** Descarga un archivo binario (p. ej. PDF) y dispara la descarga en el navegador. */
export async function downloadFile(path: string, fallbackName: string): Promise<void> {
  const response = await hermesFetch(path, {});
  if (!response.ok) {
    throw await parseError(response);
  }
  const blob = await response.blob();
  const disposition = response.headers.get('Content-Disposition') ?? '';
  const match = /filename="?([^";]+)"?/i.exec(disposition);
  const name = match?.[1] ?? fallbackName;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

const jsonHeaders = { 'Content-Type': 'application/json' };

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', headers: jsonHeaders, body: body === undefined ? undefined : JSON.stringify(body) }),
  /** POST multipart/form-data (subida de archivos). No fija Content-Type: el navegador pone el boundary. */
  postForm: <T>(path: string, form: FormData) => request<T>(path, { method: 'POST', body: form }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', headers: jsonHeaders, body: body === undefined ? undefined : JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', headers: jsonHeaders, body: body === undefined ? undefined : JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' })
};

/** Forma estándar de Spring Data `Page<T>` que devuelven los microservicios. */
export type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
};
