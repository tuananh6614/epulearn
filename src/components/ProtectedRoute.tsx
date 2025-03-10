
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
        // In production or when running as standalone app, assume API is available
        const isProduction = import.meta.env.PROD;
        const hostname = window.location.hostname;
        
        // Skip detailed API health check if we're not on localhost
        if (isProduction || (hostname !== 'localhost' && hostname !== '127.0.0.1')) {
          console.log("Running in production environment, assuming API is available");
          setApiAvailable(true);
          setHealthCheckAttempted(true);
          return;
        }
        
        // For development, check a simple endpoint that should exist
        // We'll try to fetch user/1 as a basic check - adjust based on your actual API
        const response = await fetch('http://localhost:3000/api/users/1', { 
          signal: AbortSignal.timeout(3000), // 3 second timeout
          method: 'HEAD' // We only need to check if the endpoint responds, not the actual data
        });
        
        if (response.ok || response.status === 404) {
          // Even a 404 means the server is responding, which is good enough for our health check
          setApiAvailable(true);
          setHealthCheckAttempted(true);
          return;
        }
        
        throw new Error('API health check failed');
      } catch (error) {
        console.error('API health check failed', error);
        
        // For production environment, assume API is available despite failures
        if (import.meta.env.PROD || (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')) {
          console.log("Assuming API is available in production despite failed health check");
          setApiAvailable(true);
        } else {
          setApiAvailable(false);
          toast.error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.");
        }
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
  
  // If API is not available, show a message (only in development)
  if (apiAvailable === false) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6 max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Lỗi kết nối máy chủ</h2>
          <p className="mb-6">Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại sau.</p>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            onClick={() => window.location.reload()}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
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
