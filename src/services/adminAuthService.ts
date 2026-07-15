import type { SystemUser } from '../types';
import { api, setToken } from './http';

interface ApiUser {
  id: number;
  name: string;
  email: string;
  role: SystemUser['role'];
  company_id: number | null;
}

function mapUser(u: ApiUser): SystemUser {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    companyId: u.company_id,
  };
}

/** POST /api/auth/login */
export async function login(email: string, password: string): Promise<SystemUser> {
  const res = await api<{ token: string; user: ApiUser }>('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
  setToken(res.token);
  return mapUser(res.user);
}

/** GET /api/auth/me */
export async function me(): Promise<SystemUser> {
  const res = await api<{ user: ApiUser }>('/auth/me');
  return mapUser(res.user);
}

/** POST /api/auth/logout */
export async function logout(): Promise<void> {
  try {
    await api('/auth/logout', { method: 'POST' });
  } finally {
    setToken(null);
  }
}
