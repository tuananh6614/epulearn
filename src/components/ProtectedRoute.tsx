
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { checkApiHealth } from '@/services/apiUtils';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [apiAvailable, setApiAvailable] = useState<boolean | null>(null);
  const [healthCheckAttempted, setHealthCheckAttempted] = useState(false);
  
  // Check API health on component mount
  useEffect(() => {
    const performHealthCheck = async () => {
      try {
        const isAvailable = await checkApiHealth();
        setApiAvailable(isAvailable);
        
        if (!isAvailable) {
          toast.warning("Không thể kết nối đến máy chủ. Ứng dụng sẽ chạy ở chế độ offline.", {
            duration: 5000,
          });
        }
      } catch (error) {
        console.error('API health check error:', error);
        setApiAvailable(false);
        toast.error("Lỗi kết nối đến máy chủ", {
          duration: 5000,
        });
      } finally {
        setHealthCheckAttempted(true);
      }
    };
    
    performHealthCheck();
  }, []);
  
  // Show loading state if auth is still being determined or we're checking API health
  if (authLoading || !healthCheckAttempted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }
  
  // If API is not available but we are in development, allow user to continue with limited functionality
  if (apiAvailable === false) {
    // Use toast instead of blocking access
    toast.warning("Ứng dụng đang chạy ở chế độ offline, một số tính năng có thể không hoạt động.", {
      duration: 10000,
      id: "offline-mode-warning", // prevent duplicates
    });
    
    // Continue to app instead of blocking
    if (!isAuthenticated) {
      toast.error("Bạn cần đăng nhập để truy cập trang này");
      return <Navigate to="/login" replace />;
    }
    
    return <>{children}</>;
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
