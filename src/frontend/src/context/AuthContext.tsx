import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { User } from '../types/api';
import { logout as apiLogout, getStoredUser } from '../api/auth';

// what we expose to the rest of the app through this context
interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  isAdmin: boolean;
  isManager: boolean;
  isCustomer: boolean;
  canManageEquipment: boolean;
  canManageOrders: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getStoredUser());

  const logout = useCallback(() => {
    apiLogout();
    setUser(null);
  }, []);

  // role checks based on current user
  const isAdmin = user?.Role === 'admin';
  const isManager = user?.Role === 'manager';
  const isCustomer = user?.Role === 'customer';
  const canManageEquipment = isAdmin || isManager;
  const canManageOrders = isAdmin || isManager;

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      logout,
      isAdmin,
      isManager,
      isCustomer,
      canManageEquipment,
      canManageOrders,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
