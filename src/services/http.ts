/**
 * Client HTTP da API Laravel (Sanctum, Bearer token).
 */

const BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');
const TOKEN_KEY = 'tx_admin_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class HttpError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** Corpo JSON */
  body?: unknown;
  /** Corpo multipart (uploads) — tem precedência sobre body */
  formData?: FormData;
}

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };

  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let body: BodyInit | undefined;
  if (options.formData) {
    body = options.formData;
  } else if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.body);
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/api${path}`, {
      method: options.method ?? 'GET',
      headers,
      body,
    });
  } catch {
    throw new HttpError('Não foi possível conectar à API. Verifique sua conexão.', 0);
  }

  if (response.status === 204) return undefined as T;

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401) setToken(null);
    const errors = (payload?.errors ?? undefined) as
      | Record<string, string[]>
      | undefined;
    const firstError = errors ? Object.values(errors)[0]?.[0] : undefined;
    const message =
      firstError ??
      (payload?.message as string | undefined) ??
      `Erro ${response.status} na API.`;
    throw new HttpError(message, response.status, errors);
  }

  return payload as T;
}
