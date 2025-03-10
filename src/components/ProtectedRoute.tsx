
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading, currentUser } = useAuth();
  const [apiChecked, setApiChecked] = useState(false);
  const [apiConnected, setApiConnected] = useState(true);
  
  // Check API connectivity
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const checkApiConnection = async () => {
        try {
          const response = await fetch(`http://localhost:3000/api/health-check`);
          setApiConnected(response.ok);
          if (!response.ok) {
            toast.error("Không thể kết nối đến máy chủ. Một số tính năng có thể không hoạt động đúng.");
          }
        } catch (error) {
          console.error('API connection error:', error);
          setApiConnected(false);
          toast.error("Không thể kết nối đến máy chủ. Một số tính năng có thể không hoạt động đúng.");
        } finally {
          setApiChecked(true);
        }
      };
      
      checkApiConnection();
    } else {
      setApiChecked(true);
    }
  }, [isAuthenticated, currentUser]);
  
  // Show loading state if auth is still being determined
  if (loading || !apiChecked) {
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
