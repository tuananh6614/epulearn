
import { User } from "@/types/auth";

// Fixed account for demo purposes
export const FIXED_ACCOUNT = {
  id: "demo-user-1",
  email: "demo@example.com",
  firstName: "Demo",
  lastName: "User",
  password: "password123"
};

// Parse auth error from URL with improved error messages
export const parseAuthErrorFromURL = (): { message: string | null; errorType: string | null; errorCode: string | null } => {
  const urlParams = new URLSearchParams(window.location.search);
  const errorMessage = urlParams.get('error');
  
  if (errorMessage) {
    try {
      const errorCode = urlParams.get('code');
      const errorType = urlParams.get('type');
      
      return { 
        message: decodeURIComponent(errorMessage),
        errorType, 
        errorCode 
      };
    } catch (error) {
      console.error('Error parsing auth error from URL:', error);
      return { 
        message: 'Đã xảy ra lỗi khi xử lý xác thực',
        errorType: null, 
        errorCode: null 
      };
    }
  }
  
  return { message: null, errorType: null, errorCode: null };
};
