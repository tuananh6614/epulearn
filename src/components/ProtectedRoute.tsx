
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  // If still loading auth state, show a loading indicator
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not logged in, redirect to login with a toast notification
  if (!user) {
    toast.error('Vui lòng đăng nhập để tiếp tục', {
      id: 'auth-required',
    });
    return <Navigate to="/login" replace />;
  }

  // If logged in, render the protected component
  return <>{children}</>;
};

export default ProtectedRoute;
