import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { Navigate } from 'react-router-dom';
import type { SystemUser } from '../types';
import * as adminAuthService from '../services/adminAuthService';
import { getToken } from '../services/http';

type AuthStatus = 'loading' | 'guest' | 'authenticated';

interface AdminAuthContextValue {
  user: SystemUser | null;
  status: AuthStatus;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SystemUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>(getToken() ? 'loading' : 'guest');

  // Restaura a sessão a partir do token salvo
  useEffect(() => {
    if (!getToken()) return;
    adminAuthService
      .me()
      .then((u) => {
        setUser(u);
        setStatus('authenticated');
      })
      .catch(() => setStatus('guest'));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const u = await adminAuthService.login(email, password);
    setUser(u);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(() => {
    void adminAuthService.logout();
    setUser(null);
    setStatus('guest');
  }, []);

  return (
    <AdminAuthContext.Provider value={{ user, status, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error('useAdminAuth deve ser usado dentro de <AdminAuthProvider>');
  }
  return ctx;
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { status } = useAdminAuth();

  if (status === 'loading') {
    return (
      <div className="grid min-h-screen place-items-center text-sm font-semibold text-muted">
        Carregando…
      </div>
    );
  }
  if (status === 'guest') return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}
