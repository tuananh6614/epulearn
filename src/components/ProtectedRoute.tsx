
import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading, currentUser } = useAuth();
  const [apiChecked, setApiChecked] = useState(false);
  const [apiConnected, setApiConnected] = useState(true);
  const navigate = useNavigate();
  
  // Check API connectivity
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const checkApiConnection = async () => {
        try {
          // First try the health check endpoint
          const response = await fetch(`http://localhost:3000/api/health-check`, {
            // Add timeout to prevent long hanging requests
            signal: AbortSignal.timeout(5000)
          });
          
          if (response.ok) {
            setApiConnected(true);
          } else if (response.status === 404) {
            // If health-check endpoint doesn't exist, try another endpoint
            // This is a fallback to check if the API server is running
            try {
              const fallbackResponse = await fetch(`http://localhost:3000/api/ping`, {
                signal: AbortSignal.timeout(5000)
              });
              setApiConnected(fallbackResponse.ok);
              
              if (!fallbackResponse.ok) {
                toast.error("Không thể kết nối đến máy chủ. Một số tính năng có thể không hoạt động đúng.");
              }
            } catch (error) {
              console.error('Fallback API connection error:', error);
              setApiConnected(false);
              toast.error("Không thể kết nối đến máy chủ. Một số tính năng có thể không hoạt động đúng.");
            }
          } else {
            setApiConnected(false);
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
