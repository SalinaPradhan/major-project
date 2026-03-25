import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import type { Enums } from '@/integrations/supabase/types';

type AppRole = Enums<"app_role">;

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
  redirectStudents?: boolean;
}

export function ProtectedRoute({ children, allowedRoles, redirectStudents }: ProtectedRouteProps) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect students to their dashboard when redirectStudents is set
  if (redirectStudents && role === 'student') {
    return <Navigate to="/student-dashboard" replace />;
  }

  // If specific roles are required, check if user has one of them
  if (allowedRoles && role) {
    const hasAccess = allowedRoles.includes(role);

    if (!hasAccess) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
            <p className="text-muted-foreground">
              You don't have permission to access this page.
              {role === 'student' && ' Contact your administrator for access.'}
            </p>
            <p className="text-sm text-muted-foreground">
              Your current role: <span className="capitalize font-medium">{role}</span>
            </p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
