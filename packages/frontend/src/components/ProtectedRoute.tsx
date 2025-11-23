import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

type Role = 'admin' | 'detective' | 'client';

type ProtectedRouteProps = {
  children: React.ReactNode;
  redirectTo?: string;
  allowedRoles?: Role[];
};

/**
 * ProtectedRoute
 * - Redirects to `redirectTo` (default: `/`) when unauthenticated.
 * - If `allowedRoles` is provided, it checks the current user's role and
 *   redirects to `/home` when not authorized.
 *
 * This is intentionally minimal and relies on the existing `authService`.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/',
  allowedRoles,
}) => {
  const token = useSelector((s: RootState) => s.auth.token);
  const user = useSelector(
    (s: RootState) => s.auth.user as { id: string; email: string; role?: string } | null
  );

  if (!token) return <Navigate to={redirectTo} replace />;

  if (allowedRoles && allowedRoles.length > 0) {
    if (!user || !allowedRoles.includes((user.role ?? 'client') as Role)) {
      // Authenticated but not authorized for this route
      return <Navigate to="/home" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
