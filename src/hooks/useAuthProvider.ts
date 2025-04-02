
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { User } from '@/types/auth';

// Mock fixed account for demo purposes
export const FIXED_ACCOUNT = {
  id: 'fixed-user-id-123',
  email: 'demo@example.com',
  firstName: 'Demo',
  lastName: 'User',
  password: 'password123'
};

export const useAuthProvider = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();

  // Initialize from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('epu_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("Loaded user from localStorage:", parsedUser.email);
        setCurrentUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse user from localStorage', error);
        localStorage.removeItem('epu_user');
      }
    } else {
      console.log("No user found in localStorage");
    }
    
    setLoading(false);
  }, []);

  // Update user profile
  const updateCurrentUser = async (userData: Partial<User>): Promise<boolean> => {
    if (!currentUser) return false;
    
    setLoading(true);
    
    try {
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
        
        userData.lastNameChanged = now.toISOString();
      }
      
      const updatedUser = { ...currentUser, ...userData };
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      localStorage.setItem('epu_user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      
      toast.success("Cập nhật thông tin thành công");
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Không thể cập nhật thông tin. Vui lòng thử lại sau.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!currentUser) return false;
    
    setLoading(true);
    
    try {
      if (!currentPassword || !newPassword) {
        toast.error("Vui lòng nhập đầy đủ thông tin");
        return false;
      }
      
      if (newPassword.length < 6) {
        toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
        return false;
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast.success("Mật khẩu đã được thay đổi thành công");
      return true;
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error("Không thể thay đổi mật khẩu");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Resend verification email
  const resendVerificationEmail = async (): Promise<boolean> => {
    if (!currentUser) {
      toast.error("Không có người dùng đăng nhập");
      return false;
    }
    
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Đã gửi lại email xác thực. Vui lòng kiểm tra hộp thư của bạn.", {
        duration: 6000,
      });
      return true;
    } catch (error) {
      console.error('Error resending verification email:', error);
      toast.error("Không thể gửi lại email xác thực");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Login with fixed account
  const loginWithFixedAccount = () => {
    console.log("Logging in with fixed account");
    if (!FIXED_ACCOUNT.email || !FIXED_ACCOUNT.password) {
      toast.error("Không có tài khoản cố định được thiết lập");
      return;
    }
    
    const user: User = {
      id: FIXED_ACCOUNT.id,
      email: FIXED_ACCOUNT.email,
      firstName: FIXED_ACCOUNT.firstName,
      lastName: FIXED_ACCOUNT.lastName
    };
    
    localStorage.setItem('epu_user', JSON.stringify(user));
    setCurrentUser(user);
    
    toast.success("Đăng nhập thành công với tài khoản cố định");
    navigate('/');
  };

  // Login
  const login = async (email: string, password: string): Promise<boolean> => {
    console.log("Login attempt with email:", email);
    setLoading(true);
    
    try {
      if (!email || !password) {
        toast.error("Vui lòng nhập email và mật khẩu");
        return false;
      }
      
      // Check for demo account first
      if (email === FIXED_ACCOUNT.email && password === FIXED_ACCOUNT.password) {
        console.log("Using demo account login");
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
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock successful login for demo purposes
      // In a real app, this would validate credentials against a backend
      const mockUser: User = {
        id: `user-${Date.now()}`,
        email,
        firstName: 'User',
        lastName: email.split('@')[0],
        isEmailVerified: true
      };
      
      localStorage.setItem('epu_user', JSON.stringify(mockUser));
      setCurrentUser(mockUser);
      
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

  // Sign up
  const signup = async (email: string, password: string, firstName: string, lastName: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      if (!email || !password || !firstName || !lastName) {
        toast.error("Vui lòng điền đầy đủ thông tin");
        return false;
      }
      
      if (password.length < 6) {
        toast.error("Mật khẩu phải có ít nhất 6 ký tự");
        return false;
      }
      
      if (email === FIXED_ACCOUNT.email) {
        toast.error("Email này đã được sử dụng");
        return false;
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.", {
        duration: 5000
      });
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      toast.error("Đăng ký thất bại");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    setShowLogoutConfirm(true);
  };

  // Perform logout
  const performLogout = async () => {
    try {
      setCurrentUser(null);
      localStorage.removeItem('epu_user');
      
      navigate('/login');
      toast.info("Đã đăng xuất. Hẹn gặp lại bạn!");
    } catch (error) {
      console.error('Logout error:', error);
      toast.error("Đăng xuất thất bại. Vui lòng thử lại.");
    } finally {
      setShowLogoutConfirm(false);
    }
  };

  return {
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
    changePassword,
    resendVerificationEmail,
    performLogout,
    user: currentUser
  };
};

export default useAuthProvider;
