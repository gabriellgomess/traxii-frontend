import type { AuthResponse, LoginCredentials } from '../types';
import { MOCK_USER } from '../mocks/db';
import { ApiError, delay, genId } from './api';

/** POST /api/auth/login */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  await delay();
  if (!credentials.cpf.trim() || !credentials.password.trim()) {
    throw new ApiError('Informe CPF e senha para continuar.');
  }
  return { token: genId('tk_'), user: MOCK_USER };
}

/** POST /api/auth/logout */
export async function logout(): Promise<void> {
  await delay(150);
}
