
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [apiAvailable, setApiAvailable] = useState<boolean | null>(null);
  const [healthCheckAttempted, setHealthCheckAttempted] = useState(false);
  
  // Check API health on component mount
  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        // Always assume API is available in production
        const isProduction = import.meta.env.PROD;
        const hostname = window.location.hostname;
        
        // Skip API health check if we're not on localhost
        if (isProduction || (hostname !== 'localhost' && hostname !== '127.0.0.1')) {
          console.log("Skipping API health check in production environment");
          setApiAvailable(true);
          setHealthCheckAttempted(true);
          return;
        }
        
        // Only perform health checks in development environment
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        try {
          const response = await fetch('http://localhost:3000/api/health-check', { 
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            setApiAvailable(true);
            setHealthCheckAttempted(true);
            return;
          }
          
          throw new Error('Primary health check failed');
        } catch (primaryError) {
          clearTimeout(timeoutId);
          console.warn('Primary health check failed, assuming API unavailable', primaryError);
          
          // For demo purposes, assume API is available even when check fails
          setApiAvailable(false);
          setHealthCheckAttempted(true);
          
          // Show a more friendly message
          toast.warning("Không thể kết nối đến máy chủ. Ứng dụng sẽ chạy ở chế độ offline.", {
            duration: 5000,
          });
        }
      } catch (error) {
        console.error('API health check error:', error);
        setApiAvailable(false);
        setHealthCheckAttempted(true);
      }
    };
    
    checkApiHealth();
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
