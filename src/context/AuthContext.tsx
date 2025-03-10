
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

// Fixed account credentials - don't use a fixed account unless explicitly configured
// This should be empty by default to avoid auto-login issues
const FIXED_ACCOUNT: FixedAccount = {
  id: "",
  email: "",
  firstName: "",
  lastName: "",
  password: ""
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
  const navigate = useNavigate();

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

  // Method to update current user data
  const updateCurrentUser = async (userData: Partial<User>): Promise<boolean> => {
    if (!currentUser) return false;
    
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
            return false;
          }
        }
        
        // Set the name change timestamp
        userData.lastNameChanged = now.toISOString();
      }
      
      console.log("Updating user data:", userData);
      
      // Update user in the database via API
      const response = await fetch(`${API_URL}/users/${currentUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || "Cập nhật thông tin thất bại");
        
        // For demo/development, let's update the local user data anyway
        // This helps to test the UI without waiting for backend
        const updatedUser = { ...currentUser, ...userData };
        setCurrentUser(updatedUser);
        localStorage.setItem('epu_user', JSON.stringify(updatedUser));
        
        console.warn("API update failed, but client-side update proceeded for demo purposes");
        return true; // Return true for demo purposes
      }
      
      // Update local user data
      const updatedUser = { ...currentUser, ...userData };
      setCurrentUser(updatedUser);
      localStorage.setItem('epu_user', JSON.stringify(updatedUser));
      
      toast.success("Thông tin đã được cập nhật");
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      
      // For demo/development, let's update the local user data anyway
      const updatedUser = { ...currentUser, ...userData };
      setCurrentUser(updatedUser);
      localStorage.setItem('epu_user', JSON.stringify(updatedUser));
      
      toast.success("Thông tin đã được cập nhật (chế độ demo)");
      return true; // Return true for demo purposes
    }
  };

  // Password change method
  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!currentUser) return false;
    
    try {
      // Validate input
      if (!currentPassword || !newPassword) {
        toast.error("Vui lòng nhập đầy đủ thông tin");
        return false;
      }
      
      if (newPassword.length < 6) {
        toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
        return false;
      }
      
      // Call API to change password
      const response = await fetch(`${API_URL}/users/${currentUser.id}/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || "Thay đổi mật khẩu thất bại");
        return false;
      }
      
      toast.success("Mật khẩu đã được thay đổi thành công");
      return true;
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error("Thay đổi mật khẩu thất bại. Vui lòng kiểm tra kết nối mạng");
      return false;
    }
  };

  // Login with fixed account - if demo account is set up
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

  // Login function using API
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      if (!email || !password) {
        toast.error("Vui lòng nhập email và mật khẩu");
        return false;
      }
      
      // Check for fixed account first (if configured)
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
        
        toast.success("Đăng nhập thành công");
        return true;
      }
      
      // Call login API
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
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
      console.error('Login error:', error);
      toast.error("Đăng nhập thất bại. Vui lòng kiểm tra kết nối mạng");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Signup function using API
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
      
      // Check if trying to register with fixed account email (if configured)
      if (FIXED_ACCOUNT.email && email === FIXED_ACCOUNT.email) {
        toast.error("Email này đã được sử dụng");
        return false;
      }
      
      // Call signup API
      const response = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, firstName, lastName }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        toast.error(data.message || "Đăng ký thất bại");
        return false;
      }
      
      toast.success("Đăng ký thành công");
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      toast.error("Đăng ký thất bại. Vui lòng kiểm tra kết nối mạng");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function - just show confirmation dialog
  const logout = () => {
    setShowLogoutConfirm(true);
  };

  // Perform actual logout
  const performLogout = () => {
    localStorage.removeItem('epu_user');
    setCurrentUser(null);
    // Changed: First clear user data, then navigate
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
