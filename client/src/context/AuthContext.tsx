import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { AuthResponse, AuthUser, LoginInput, RegisterInput } from '@guard-provider/shared';
import { api, tokenStorage } from '@/lib/api';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  login: (input: LoginInput) => Promise<AuthUser>;
  register: (input: RegisterInput) => Promise<AuthUser>;
  logout: () => void;
  setUser: (user: AuthUser) => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  // Computed once: no point validating a token that was never stored.
  const [status, setStatus] = useState<AuthStatus>(() =>
    tokenStorage.get() ? 'loading' : 'unauthenticated',
  );

  const applyAuthResponse = useCallback((response: AuthResponse) => {
    tokenStorage.set(response.token);
    setUserState(response.user);
    setStatus('authenticated');
    return response.user;
  }, []);

  // Restore the session from a persisted token on first load.
  useEffect(() => {
    let active = true;
    const token = tokenStorage.get();
    if (!token) return;
    api
      .get<AuthUser>('/auth/me')
      .then((me) => {
        if (!active) return;
        setUserState(me);
        setStatus('authenticated');
      })
      .catch(() => {
        if (!active) return;
        tokenStorage.clear();
        setUserState(null);
        setStatus('unauthenticated');
      });
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(
    async (input: LoginInput) => applyAuthResponse(await api.post<AuthResponse>('/auth/login', input)),
    [applyAuthResponse],
  );

  const register = useCallback(
    async (input: RegisterInput) =>
      applyAuthResponse(await api.post<AuthResponse>('/auth/register', input)),
    [applyAuthResponse],
  );

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUserState(null);
    setStatus('unauthenticated');
  }, []);

  const setUser = useCallback((next: AuthUser) => setUserState(next), []);

  const refresh = useCallback(async () => {
    if (!tokenStorage.get()) return;
    try {
      const me = await api.get<AuthUser>('/auth/me');
      setUserState(me);
      setStatus('authenticated');
    } catch {
      logout();
    }
  }, [logout]);

  const value = useMemo(
    () => ({ user, status, login, register, logout, setUser, refresh }),
    [user, status, login, register, logout, setUser, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
