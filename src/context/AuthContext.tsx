
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
}

// Define a registered user type that includes password
interface RegisteredUser extends User {
  password: string;
}

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

  // Login function with registered user validation
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simple validation - in real app this would be server-side
      if (!email || !password) {
        toast.error("Vui lòng nhập email và mật khẩu");
        return false;
      }
      
      if (password.length < 6) {
        toast.error("Mật khẩu phải có ít nhất 6 ký tự");
        return false;
      }
      
      // Get registered users from localStorage
      const registeredUsersJSON = localStorage.getItem('epu_registered_users');
      const registeredUsers: RegisteredUser[] = registeredUsersJSON ? JSON.parse(registeredUsersJSON) : [];
      
      // Check if the user is registered
      const registeredUser = registeredUsers.find(
        user => user.email === email && user.password === password
      );
      
      if (!registeredUser) {
        toast.error("Thông tin đăng nhập không chính xác hoặc tài khoản chưa được đăng ký");
        return false;
      }
      
      // Create user object without password for session
      const user: User = {
        id: registeredUser.id,
        email: registeredUser.email,
        firstName: registeredUser.firstName,
        lastName: registeredUser.lastName,
      };
      
      // Save user to localStorage
      localStorage.setItem('epu_user', JSON.stringify(user));
      setCurrentUser(user);
      
      toast.success("Đăng nhập thành công");
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error("Đăng nhập thất bại");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Signup function that stores users in localStorage
  const signup = async (email: string, password: string, firstName: string, lastName: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simple validation
      if (!email || !password || !firstName || !lastName) {
        toast.error("Vui lòng điền đầy đủ thông tin");
        return false;
      }
      
      if (password.length < 6) {
        toast.error("Mật khẩu phải có ít nhất 6 ký tự");
        return false;
      }
      
      // Get registered users from localStorage
      const registeredUsersJSON = localStorage.getItem('epu_registered_users');
      const registeredUsers: RegisteredUser[] = registeredUsersJSON ? JSON.parse(registeredUsersJSON) : [];
      
      // Check if email is already registered
      if (registeredUsers.some(user => user.email === email)) {
        toast.error("Email này đã được đăng ký");
        return false;
      }
      
      // Create new user
      const newUser: RegisteredUser = {
        id: crypto.randomUUID(),
        email,
        password,
        firstName,
        lastName,
      };
      
      // Add to registered users and save
      registeredUsers.push(newUser);
      localStorage.setItem('epu_registered_users', JSON.stringify(registeredUsers));
      
      toast.success("Đăng ký thành công");
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      toast.error("Đăng ký thất bại");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setShowLogoutConfirm(true);
  };

  // Perform actual logout
  const performLogout = () => {
    localStorage.removeItem('epu_user');
    setCurrentUser(null);
    navigate('/');
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
