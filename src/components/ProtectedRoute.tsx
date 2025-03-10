
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  // Show loading state if auth is still being determined
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
    </div>;
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    toast.error("Bạn cần đăng nhập để truy cập trang này");
    return <Navigate to="/login" replace />;
  }
  
  // Render children if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;
