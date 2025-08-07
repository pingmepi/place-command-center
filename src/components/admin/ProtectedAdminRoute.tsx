import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthProvider';
import { Shield } from 'lucide-react';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

export function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const { user, isAdmin, isLoading } = useAdminAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-pulse">
            <Shield className="h-8 w-8 mx-auto mb-4 text-primary" />
          </div>
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    // Store the intended location for redirect after login
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}