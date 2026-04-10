import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { User } from '../types/api';
import { logout as apiLogout, getStoredUser } from '../api/auth';

interface AuthContextValue {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Restore session from localStorage on first load
  const [user, setUserState] = useState<User | null>(() => getStoredUser());

  const setUser = useCallback((u: User | null) => {
    setUserState(u);
  }, []);

  const logout = useCallback(() => {
    apiLogout(); // clears localStorage tokens + user
    setUserState(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}