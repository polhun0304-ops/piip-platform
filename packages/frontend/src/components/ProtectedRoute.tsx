import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { UserRole } from '../store/authSlice';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
}

/**
 * ProtectedRoute component that guards routes based on authentication and optional role
 * 
 * @param children - The component to render if access is granted
 * @param requiredRole - Optional role required to access the route
 * @returns The children if authenticated and authorized, otherwise redirects to login
 */
export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if a specific role is required
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to unauthorized page or home
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
