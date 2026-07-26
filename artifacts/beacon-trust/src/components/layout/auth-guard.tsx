import { ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Redirect } from 'wouter';
import { Skeleton } from '@/components/ui/skeleton';

interface AuthGuardProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    if (user.role === 'admin') return <Redirect to="/admin" />;
    if (user.role === 'staff') return <Redirect to="/staff" />;
    return <Redirect to="/dashboard" />;
  }

  return <>{children}</>;
}
