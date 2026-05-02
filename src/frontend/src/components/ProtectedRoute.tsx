import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types/api';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: UserRole[];
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { user, isProfileComplete } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (user && !isProfileComplete) return <Navigate to="/complete-profile" replace />;
  if (roles && !roles.includes(user.Role)) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}
