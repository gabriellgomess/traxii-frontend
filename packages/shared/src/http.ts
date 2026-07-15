/**
 * Client HTTP da API Laravel (Sanctum, Bearer token).
 * Cada app configura sua base URL e chave de token no boot via configureApi().
 */

export interface ApiConfig {
  baseUrl: string;
  tokenKey: string;
}

let config: ApiConfig = { baseUrl: '', tokenKey: 'tx_token' };

export function configureApi(partial: Partial<ApiConfig>): void {
  config = {
    ...config,
    ...partial,
    baseUrl: (partial.baseUrl ?? config.baseUrl).replace(/\/+$/, ''),
  };
}

export function getToken(): string | null {
  return localStorage.getItem(config.tokenKey);
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(config.tokenKey, token);
  else localStorage.removeItem(config.tokenKey);
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
    response = await fetch(`${config.baseUrl}/api${path}`, {
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
