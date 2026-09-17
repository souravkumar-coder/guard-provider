import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { UserRole } from '@guard-provider/shared';
import { useAuth } from '@/context/AuthContext';
import { FullPageLoader } from '@/components/ui/Spinner';
import { homePath } from '@/lib/utils';

interface RequireRoleProps {
  /** Omit to allow any signed-in role. */
  role?: UserRole;
  children: ReactNode;
}

/** Gate for protected routes: redirects anonymous users to /login and
 *  wrong-role users to their own dashboard home. */
export function RequireRole({ role, children }: RequireRoleProps) {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <FullPageLoader label="Checking your session…" />;
  }
  if (status === 'unauthenticated' || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  if (role && user.role !== role) {
    return <Navigate to={homePath(user.role)} replace />;
  }
  return <>{children}</>;
}
