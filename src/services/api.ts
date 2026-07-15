/**
 * Utilidades da camada de serviço.
 * Quando a API Laravel existir, este arquivo passa a configurar o axios
 * (baseURL, interceptors de token etc.) e os services trocam os mocks
 * por chamadas HTTP — as assinaturas permanecem as mesmas.
 */

export const API_DELAY = 450;

export function delay(ms: number = API_DELAY): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function genAuthCode(): string {
  const c =
    'E' +
    Math.random().toString(36).slice(2, 10).toUpperCase() +
    Math.random().toString(36).slice(2, 12).toUpperCase();
  return c.slice(0, 22);
}

export function genId(prefix = ''): string {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
  }
}
