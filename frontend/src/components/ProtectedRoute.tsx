import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
}

function getRoleDashboard(role: UserRole): string {
  switch (role) {
    case 'SENDER':
      return '/dashboard/sender';
    case 'TRAVELER':
      return '/dashboard/traveler';
    case 'AGENT':
      return '/dashboard/agent';
    case 'ADMIN':
      return '/admin';
    default:
      return '/';
  }
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={getRoleDashboard(user.role)} replace />;
  }

  return <Outlet />;
}
