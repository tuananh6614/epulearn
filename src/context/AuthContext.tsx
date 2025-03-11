
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Define the user type
interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  lastNameChanged?: string; // Track when name was last changed
  avatarUrl?: string; // Add support for user avatar
  bio?: string; // User bio information
}

// Define fixed account type to match User type
interface FixedAccount extends User {
  password: string;
}

// Base API URL for your MySQL backend
const API_URL = 'http://localhost:3000/api';

// Fixed account credentials for development/demo purposes
const FIXED_ACCOUNT: FixedAccount = {
  id: "demo-user-1",
  email: "demo@example.com",
  firstName: "Demo",
  lastName: "User",
  password: "password123"
};

// Define the auth context type
interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  showLogoutConfirm: boolean;
  setShowLogoutConfirm: (show: boolean) => void;
  loginWithFixedAccount: () => void;
  updateCurrentUser: (userData: Partial<User>) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [apiConnectionState, setApiConnectionState] = useState<'available' | 'unavailable' | 'unknown'>('unknown');
  const navigate = useNavigate();

  // Check API connection on mount
  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        const response = await fetch(`${API_URL}/health-check`, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          setApiConnectionState('available');
        } else {
          setApiConnectionState('unavailable');
        }
      } catch (error) {
        console.warn('API connection check failed:', error);
        setApiConnectionState('unavailable');
      }
    };
    
    checkApiConnection();
  }, []);

  // Check if there's a logged-in user in localStorage on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('epu_user');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse user from localStorage', error);
        localStorage.removeItem('epu_user');
      }
    }
    setLoading(false);
  }, []);

  // Method to update current user data with improved error handling
  const updateCurrentUser = async (userData: Partial<User>): Promise<boolean> => {
    if (!currentUser) return false;
    
    setLoading(true);
    
    try {
      // Handle name change restrictions (once every 5 days)
      if ((userData.firstName !== undefined && userData.firstName !== currentUser.firstName) ||
          (userData.lastName !== undefined && userData.lastName !== currentUser.lastName)) {
        
        const lastChanged = currentUser.lastNameChanged ? new Date(currentUser.lastNameChanged) : null;
        const now = new Date();
        
        if (lastChanged) {
          const diffDays = Math.floor((now.getTime() - lastChanged.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDays < 5) {
            toast.error(`Bạn chỉ có thể thay đổi tên mỗi 5 ngày. Vui lòng thử lại sau ${5 - diffDays} ngày.`);
            setLoading(false);
            return false;
          }
        }
        
        // Set the name change timestamp
        userData.lastNameChanged = now.toISOString();
      }
      
      console.log("Updating user data:", userData);
      
      // Try to update the database if API is available
      if (apiConnectionState === 'available') {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);
          
          const response = await fetch(`${API_URL}/users/${currentUser.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error('Server responded with an error');
          }
          
          // Update local storage AFTER successful API update
          const updatedUser = { ...currentUser, ...userData };
          localStorage.setItem('epu_user', JSON.stringify(updatedUser));
          setCurrentUser(updatedUser);
          
          setLoading(false);
          return true;
        } catch (error) {
          console.error('Error updating profile on server:', error);
          
          // Fall back to local storage update only
          const updatedUser = { ...currentUser, ...userData };
          localStorage.setItem('epu_user', JSON.stringify(updatedUser));
          setCurrentUser(updatedUser);
          
          setLoading(false);
          return false; // Return false to indicate DB sync failed
        }
      } else {
        // If API is unavailable, update local storage only
        const updatedUser = { ...currentUser, ...userData };
        localStorage.setItem('epu_user', JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
        
        toast.warning("Đã lưu thay đổi cục bộ, dữ liệu sẽ được đồng bộ khi có kết nối.");
        setLoading(false);
        return false; // Return false to indicate DB sync failed
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Không thể cập nhật thông tin. Vui lòng kiểm tra kết nối đến máy chủ và thử lại sau.");
      setLoading(false);
      return false;
    }
  };

  // Password change method with improved error handling
  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!currentUser) return false;
    
    setLoading(true);
    
    try {
      // Validate input
      if (!currentPassword || !newPassword) {
        toast.error("Vui lòng nhập đầy đủ thông tin");
        setLoading(false);
        return false;
      }
      
      if (newPassword.length < 6) {
        toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
        setLoading(false);
        return false;
      }
      
      // Check if API is available
      if (apiConnectionState === 'available') {
        try {
          // First verify current password
          const verifyResponse = await fetch(`${API_URL}/check-password`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              userId: currentUser.id, 
              password: currentPassword 
            }),
            signal: AbortSignal.timeout(3000)
          });
          
          if (!verifyResponse.ok) {
            toast.error("Mật khẩu hiện tại không chính xác");
            setLoading(false);
            return false;
          }
          
          // If verification passed, try to change password
          const changeResponse = await fetch(`${API_URL}/users/${currentUser.id}/change-password`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ currentPassword, newPassword }),
            signal: AbortSignal.timeout(3000)
          });
          
          if (!changeResponse.ok) {
            // Try fallback endpoint if main one fails
            const fallbackResponse = await fetch(`${API_URL}/change-password`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                userId: currentUser.id, 
                currentPassword, 
                newPassword 
              }),
              signal: AbortSignal.timeout(3000)
            });
            
            if (!fallbackResponse.ok) {
              throw new Error('Không thể cập nhật mật khẩu trên máy chủ');
            }
          }
          
          toast.success("Mật khẩu đã được thay đổi thành công và đồng bộ với CSDL");
          setLoading(false);
          return true;
        } catch (error) {
          console.error('Error changing password:', error);
          toast.error("Không thể thay đổi mật khẩu. Vui lòng kiểm tra kết nối đến máy chủ và thử lại sau.");
          setLoading(false);
          return false;
        }
      } else {
        toast.error("Không thể thay đổi mật khẩu khi không có kết nối đến máy chủ");
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error("Không thể thay đổi mật khẩu. Vui lòng kiểm tra kết nối đến máy chủ và thử lại sau.");
      setLoading(false);
      return false;
    }
  };

  const loginWithFixedAccount = () => {
    // Check if fixed account is configured
    if (!FIXED_ACCOUNT.email || !FIXED_ACCOUNT.password) {
      toast.error("Không có tài khoản cố định được thiết lập");
      return;
    }
    
    setLoading(true);
    
    // Create user object from fixed account (without password)
    const user: User = {
      id: FIXED_ACCOUNT.id,
      email: FIXED_ACCOUNT.email,
      firstName: FIXED_ACCOUNT.firstName,
      lastName: FIXED_ACCOUNT.lastName
    };
    
    // Save to localStorage
    localStorage.setItem('epu_user', JSON.stringify(user));
    setCurrentUser(user);
    
    toast.success("Đăng nhập thành công với tài khoản cố định");
    navigate('/');
    setLoading(false);
  };

  // Login function with improved error handling
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      if (!email || !password) {
        toast.error("Vui lòng nhập email và mật khẩu");
        return false;
      }
      
      // Check for fixed account first (for development/offline use)
      if (FIXED_ACCOUNT.email && FIXED_ACCOUNT.password && 
          email === FIXED_ACCOUNT.email && password === FIXED_ACCOUNT.password) {
        const user: User = {
          id: FIXED_ACCOUNT.id,
          email: FIXED_ACCOUNT.email,
          firstName: FIXED_ACCOUNT.firstName,
          lastName: FIXED_ACCOUNT.lastName
        };
        
        localStorage.setItem('epu_user', JSON.stringify(user));
        setCurrentUser(user);
        
        toast.success("Đăng nhập thành công (Tài khoản demo)");
        return true;
      }
      
      // Try to connect to API if available
      if (apiConnectionState === 'available') {
        try {
          // Call login API with timeout
          const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
            signal: AbortSignal.timeout(3000)
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            toast.error(data.message || "Đăng nhập thất bại");
            return false;
          }
          
          // Save user info to localStorage
          localStorage.setItem('epu_user', JSON.stringify(data.user));
          setCurrentUser(data.user);
          
          toast.success("Đăng nhập thành công");
          return true;
        } catch (error) {
          console.error('Login error with API:', error);
          
          // If API fails and email matches fixed account for demo, allow login
          if (email === FIXED_ACCOUNT.email && password === FIXED_ACCOUNT.password) {
            const user: User = {
              id: FIXED_ACCOUNT.id,
              email: FIXED_ACCOUNT.email,
              firstName: FIXED_ACCOUNT.firstName,
              lastName: FIXED_ACCOUNT.lastName
            };
            
            localStorage.setItem('epu_user', JSON.stringify(user));
            setCurrentUser(user);
            
            toast.success("Đăng nhập thành công (Chế độ offline)");
            return true;
          }
          
          toast.error("Đăng nhập thất bại. Không thể kết nối đến máy chủ");
          return false;
        }
      } else {
        // If API unavailable, only allow login with fixed account for demo
        if (email === FIXED_ACCOUNT.email && password === FIXED_ACCOUNT.password) {
          const user: User = {
            id: FIXED_ACCOUNT.id,
            email: FIXED_ACCOUNT.email,
            firstName: FIXED_ACCOUNT.firstName,
            lastName: FIXED_ACCOUNT.lastName
          };
          
          localStorage.setItem('epu_user', JSON.stringify(user));
          setCurrentUser(user);
          
          toast.success("Đăng nhập thành công (Chế độ offline)");
          return true;
        } else {
          toast.error("Không thể đăng nhập khi không có kết nối đến máy chủ");
          return false;
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error("Đăng nhập thất bại. Vui lòng kiểm tra kết nối mạng");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Signup function with improved error handling
  const signup = async (email: string, password: string, firstName: string, lastName: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Validate input
      if (!email || !password || !firstName || !lastName) {
        toast.error("Vui lòng điền đầy đủ thông tin");
        return false;
      }
      
      if (password.length < 6) {
        toast.error("Mật khẩu phải có ít nhất 6 ký tự");
        return false;
      }
      
      // Check if trying to register with fixed account email
      if (FIXED_ACCOUNT.email && email === FIXED_ACCOUNT.email) {
        toast.error("Email này đã được sử dụng");
        return false;
      }
      
      // Check if API is available
      if (apiConnectionState === 'available') {
        try {
          // Call signup API with timeout
          const response = await fetch(`${API_URL}/signup`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, firstName, lastName }),
            signal: AbortSignal.timeout(3000)
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            toast.error(data.message || "Đăng ký thất bại");
            return false;
          }
          
          toast.success("Đăng ký thành công");
          return true;
        } catch (error) {
          console.error('Signup error with API:', error);
          toast.error("Đăng ký thất bại. Không thể kết nối đến máy chủ");
          return false;
        }
      } else {
        toast.error("Không thể đăng ký khi không có kết nối đến máy chủ");
        return false;
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error("Đăng ký thất bại. Vui lòng kiểm tra kết nối mạng");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function - show confirmation dialog
  const logout = () => {
    setShowLogoutConfirm(true);
  };

  // Perform actual logout
  const performLogout = () => {
    localStorage.removeItem('epu_user');
    setCurrentUser(null);
    navigate('/login');
    toast.info("Đã đăng xuất. Hẹn gặp lại bạn!");
    setShowLogoutConfirm(false);
  };

  const value = {
    currentUser,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!currentUser,
    showLogoutConfirm,
    setShowLogoutConfirm,
    loginWithFixedAccount,
    updateCurrentUser,
    changePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận đăng xuất</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn đăng xuất không? Hệ thống sẽ không lưu tiến trình hiện tại của bạn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={performLogout}>Đăng xuất</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AuthContext.Provider>
  );
};

// Hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
