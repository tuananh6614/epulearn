
import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { checkApiHealth } from '@/services/apiUtils';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, loading: authLoading, currentUser, resendVerificationEmail } = useAuth();
  const [apiAvailable, setApiAvailable] = useState<boolean | null>(null);
  const [healthCheckAttempted, setHealthCheckAttempted] = useState(false);
  const [showEmailAlert, setShowEmailAlert] = useState(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  
  // Check for auth error in URL
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('error=') && hash.includes('error_code=')) {
      const errorParams = new URLSearchParams(hash.substring(1));
      const errorType = errorParams.get('error');
      const errorCode = errorParams.get('error_code');
      const errorDescription = errorParams.get('error_description');
      
      if (errorType && errorCode) {
        let message = 'Lỗi xác thực';
        
        if (errorCode === 'otp_expired') {
          message = 'Liên kết email đã hết hạn. Vui lòng yêu cầu gửi lại email xác thực.';
        } else if (errorDescription) {
          message = errorDescription.replace(/\+/g, ' ');
        }
        
        toast.error(message, {
          duration: 8000,
        });
        
        // Remove the error from the URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [location]);
  
  useEffect(() => {
    const performHealthCheck = async () => {
      try {
        console.log("ProtectedRoute: Starting API health check");
        const isAvailable = await checkApiHealth();
        console.log("ProtectedRoute: API available:", isAvailable);
        setApiAvailable(isAvailable);
        
        if (!isAvailable) {
          toast.warning("Không thể kết nối đến Supabase. Vui lòng kiểm tra kết nối mạng.", {
            duration: 8000,
          });
        }
      } catch (error) {
        console.error('API health check error:', error);
        setApiAvailable(false);
        toast.error("Lỗi kết nối đến Supabase. Hãy kiểm tra kết nối internet.", {
          duration: 8000,
        });
      } finally {
        setHealthCheckAttempted(true);
      }
    };
    
    performHealthCheck();
  }, []);
  
  useEffect(() => {
    if (currentUser && (currentUser.email_confirmed_at === undefined || currentUser.email_confirmed_at === null)) {
      setShowEmailAlert(true);
      toast.warning("Email của bạn chưa được xác thực. Một số tính năng có thể bị hạn chế.", {
        duration: 10000,
        id: "email-not-verified", // prevent duplicates
      });
    } else {
      setShowEmailAlert(false);
    }
  }, [currentUser]);
  
  const handleResendEmail = async () => {
    if (isResendingEmail) return;
    
    setIsResendingEmail(true);
    try {
      await resendVerificationEmail();
    } finally {
      setIsResendingEmail(false);
    }
  };
  
  if (authLoading || !healthCheckAttempted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }
  
  if (apiAvailable === false) {
    toast.warning("Không thể kết nối đến Supabase. Một số tính năng có thể không hoạt động.", {
      duration: 10000,
      id: "offline-mode-warning", // prevent duplicates
    });
    
    if (!isAuthenticated) {
      toast.error("Bạn cần đăng nhập để truy cập trang này");
      return <Navigate to="/login" replace />;
    }
    
    return <>{children}</>;
  }
  
  if (!isAuthenticated) {
    toast.error("Bạn cần đăng nhập để truy cập trang này");
    return <Navigate to="/login" replace />;
  }
  
  return (
    <>
      {showEmailAlert && (
        <div className="fixed top-16 left-0 right-0 z-50 px-4 py-2 bg-amber-50 border-b border-amber-200">
          <div className="container mx-auto">
            <Alert variant="default" className="bg-amber-50 border-amber-300">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800">Email chưa xác thực</AlertTitle>
              <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-amber-700">Vui lòng kiểm tra hộp thư và xác nhận email để sử dụng đầy đủ tính năng</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleResendEmail}
                  disabled={isResendingEmail}
                  className="w-fit text-amber-700 border-amber-300 hover:bg-amber-100"
                >
                  {isResendingEmail ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang gửi...
                    </>
                  ) : "Gửi lại email xác thực"}
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )}
      {children}
    </>
  );
};

export default ProtectedRoute;
