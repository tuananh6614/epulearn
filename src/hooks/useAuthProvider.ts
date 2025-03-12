
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { User } from '@/types/auth';
import { fetchUserProfile, FIXED_ACCOUNT, handleAuthStateChange } from '@/utils/authUtils';

export const useAuthProvider = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);
  const navigate = useNavigate();

  // Initialize from localStorage
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
  }, []);

  // Check authentication and set up subscription
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const userData = await fetchUserProfile(session.user.id, session.user.email || '', session.user.email_confirmed_at);
          if (userData) {
            setCurrentUser(userData);
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setLoading(false);
        setAuthInitialized(true);
      }
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        await handleAuthStateChange(event, session, setCurrentUser);
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
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
      
      const updateData: Record<string, any> = {};
      
      if (userData.firstName !== undefined) updateData.first_name = userData.firstName;
      if (userData.lastName !== undefined) updateData.last_name = userData.lastName;
      if (userData.avatarUrl !== undefined) updateData.avatar_url = userData.avatarUrl;
      if (userData.bio !== undefined) updateData.bio = userData.bio;
      if (userData.isVip !== undefined) updateData.is_vip = userData.isVip;
      if (userData.vipExpirationDate !== undefined) updateData.vip_expiration_date = userData.vipExpirationDate;
      
      updateData.updated_at = new Date().toISOString();
      
      if (Object.keys(updateData).length > 0) {
        const { error } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', currentUser.id);
        
        if (error) {
          console.error('Error updating profile:', error);
          toast.error("Không thể cập nhật thông tin. " + error.message);
          setLoading(false);
          return false;
        }
      }
      
      const updatedUser = { ...currentUser, ...userData };
      
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
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        console.error('Error changing password:', error);
        toast.error(error.message || "Không thể thay đổi mật khẩu");
        return false;
      }
      
      toast.success("Mật khẩu đã được thay đổi thành công");
      return true;
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error((error as Error).message || "Không thể thay đổi mật khẩu");
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
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: currentUser.email,
      });
      
      if (error) {
        console.error('Error resending verification email:', error);
        toast.error(error.message || "Không thể gửi lại email xác thực");
        return false;
      }
      
      toast.success("Đã gửi lại email xác thực. Vui lòng kiểm tra hộp thư của bạn.", {
        duration: 6000,
      });
      return true;
    } catch (error) {
      console.error('Error resending verification email:', error);
      toast.error((error as Error).message || "Không thể gửi lại email xác thực");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Login with fixed account
  const loginWithFixedAccount = () => {
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
    setLoading(true);
    
    try {
      if (!email || !password) {
        toast.error("Vui lòng nhập email và mật khẩu");
        return false;
      }
      
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
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Login error:', error);
        toast.error(error.message || "Đăng nhập thất bại");
        return false;
      }
      
      const userData = await fetchUserProfile(data.user.id, data.user.email || '', data.user.email_confirmed_at);
      if (userData) {
        setCurrentUser(userData);
      }
      
      toast.success("Đăng nhập thành công");
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error((error as Error).message || "Đăng nhập thất bại");
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
      
      if (FIXED_ACCOUNT.email && email === FIXED_ACCOUNT.email) {
        toast.error("Email này đã được sử dụng");
        return false;
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName
          },
          emailRedirectTo: window.location.origin + '/login'
        }
      });
      
      if (error) {
        console.error('Signup error:', error);
        toast.error(error.message || "Đăng ký thất bại");
        return false;
      }
      
      toast.success("Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.", {
        duration: 5000
      });
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      toast.error((error as Error).message || "Đăng ký thất bại");
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
      
      supabase.auth.signOut();
      
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
