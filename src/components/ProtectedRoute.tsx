
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { checkApiHealth } from '@/services/apiUtils';
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { isMobile, isOnline, retryPromise } from '@/lib/utils';

// Pre-loading component to increase perceived performance
const PageLoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <Loader2 className="h-8 w-8 animate-spin text-green-500" />
  </div>
);

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
  const [isRetrying, setIsRetrying] = useState(false);
  
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
  
  // Prefetch and check API health with debounce to avoid excessive network requests
  const performHealthCheck = useCallback(async () => {
    // Only perform health check if not already attempted 
    // or if we're explicitly retrying
    if (!healthCheckAttempted || isRetrying) {
      try {
        if (!isOnline()) {
          setApiAvailable(false);
          toast.warning("Không có kết nối mạng. Vui lòng kiểm tra kết nối internet của bạn.", {
            duration: 8000,
          });
          return false;
        }

        setIsRetrying(true);
        // Use a faster retry with fewer attempts
        const isAvailable = await retryPromise(() => checkApiHealth(), 1, 500);
        setApiAvailable(isAvailable);
        
        if (!isAvailable) {
          toast.warning("Không thể kết nối đến Supabase. Vui lòng kiểm tra kết nối mạng.", {
            duration: 8000,
          });
        }
        
        return isAvailable;
      } catch (error) {
        console.error('API health check error:', error);
        setApiAvailable(false);
        toast.error("Lỗi kết nối đến Supabase. Hãy kiểm tra kết nối internet.", {
          duration: 8000,
        });
        return false;
      } finally {
        setHealthCheckAttempted(true);
        setIsRetrying(false);
      }
    }
    return apiAvailable || false;
  }, [healthCheckAttempted, isRetrying, apiAvailable]);
  
  useEffect(() => {
    performHealthCheck();
  }, [performHealthCheck]);
  
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
  
  const handleRetry = () => {
    performHealthCheck();
  };
  
  if (authLoading) {
    return <PageLoadingFallback />;
  }
  
  if (apiAvailable === false && !isRetrying) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <h2 className="text-xl font-bold">Lỗi kết nối</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet của bạn và thử lại.
            </p>
            <Button 
              onClick={handleRetry}
              className="mt-2 w-full"
              disabled={isRetrying}
            >
              {isRetrying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang kết nối lại...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Thử lại
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    toast.error("Bạn cần đăng nhập để truy cập trang này");
    return <Navigate to="/login" replace />;
  }
  
  return (
    <Suspense fallback={<PageLoadingFallback />}>
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
    </Suspense>
  );
};

export default React.memo(ProtectedRoute);
