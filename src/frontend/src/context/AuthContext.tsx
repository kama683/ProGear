import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { User } from '../types/api';
import { logout as apiLogout, getStoredUser } from '../api/auth';

interface AuthContextValue {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  isAdmin: boolean;
  isManager: boolean;
  isCustomer: boolean;
  canManageEquipment: boolean;
  canManageOrders: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(() => getStoredUser());

  const setUser = useCallback((u: User | null) => setUserState(u), []);

  const logout = useCallback(() => {
    apiLogout();
    setUserState(null);
  }, []);

  const isAdmin = user?.Role === 'admin';
  const isManager = user?.Role === 'manager';
  const isCustomer = user?.Role === 'customer';
  const canManageEquipment = isAdmin || isManager;
  const canManageOrders = isAdmin || isManager;

  return (
    <AuthContext.Provider value={{ user, setUser, logout, isAdmin, isManager, isCustomer, canManageEquipment, canManageOrders }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
