
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
import { supabase } from "@/integrations/supabase/client";

// Define the user type
interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  lastNameChanged?: string; // Track when name was last changed
  avatarUrl?: string; // Add support for user avatar
  bio?: string; // User bio information
  email_confirmed_at?: string | null; // Add this property for email verification status
}

// Define fixed account type to match User type
interface FixedAccount extends User {
  password: string;
}

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
  const navigate = useNavigate();

  // Check if there's a logged-in user in localStorage on initial load or through Supabase session
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      
      // Check Supabase session first
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Get user profile data from Supabase
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (profileData) {
          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            firstName: profileData.first_name,
            lastName: profileData.last_name,
            avatarUrl: profileData.avatar_url,
            bio: profileData.bio,
            email_confirmed_at: session.user.email_confirmed_at
          };
          
          setCurrentUser(userData);
          localStorage.setItem('epu_user', JSON.stringify(userData));
        } else {
          // Fallback to basic user data if profile not found
          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            email_confirmed_at: session.user.email_confirmed_at
          };
          
          setCurrentUser(userData);
          localStorage.setItem('epu_user', JSON.stringify(userData));
        }
      } else {
        // Check localStorage as fallback
        const storedUser = localStorage.getItem('epu_user');
        if (storedUser) {
          try {
            setCurrentUser(JSON.parse(storedUser));
          } catch (error) {
            console.error('Failed to parse user from localStorage', error);
            localStorage.removeItem('epu_user');
          }
        }
      }
      
      setLoading(false);
    };
    
    checkAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Get user profile data
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profileData) {
            const userData: User = {
              id: session.user.id,
              email: session.user.email || '',
              firstName: profileData.first_name,
              lastName: profileData.last_name,
              avatarUrl: profileData.avatar_url,
              bio: profileData.bio,
              email_confirmed_at: session.user.email_confirmed_at
            };
            
            setCurrentUser(userData);
            localStorage.setItem('epu_user', JSON.stringify(userData));
          } else {
            // Fallback to basic user data if profile not found
            const userData: User = {
              id: session.user.id,
              email: session.user.email || '',
              email_confirmed_at: session.user.email_confirmed_at
            };
            
            setCurrentUser(userData);
            localStorage.setItem('epu_user', JSON.stringify(userData));
          }

          // Show confirmation message if the email was just verified
          if (event === 'SIGNED_IN' && session.user.email_confirmed_at) {
            toast.success("Email của bạn đã được xác thực thành công!");
          }
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          localStorage.removeItem('epu_user');
        } else if (event === 'USER_UPDATED') {
          // Update the current user data when user is updated (e.g. email verification)
          if (session) {
            // Update the current user with the latest session data
            setCurrentUser(prevUser => 
              prevUser ? {
                ...prevUser,
                email_confirmed_at: session.user.email_confirmed_at
              } : null
            );
            
            // Update localStorage
            const storedUser = localStorage.getItem('epu_user');
            if (storedUser) {
              try {
                const parsedUser = JSON.parse(storedUser);
                localStorage.setItem('epu_user', JSON.stringify({
                  ...parsedUser,
                  email_confirmed_at: session.user.email_confirmed_at
                }));
              } catch (error) {
                console.error('Failed to update user in localStorage', error);
              }
            }
            
            // Show confirmation message if the email was just verified
            if (session.user.email_confirmed_at) {
              toast.success("Email của bạn đã được xác thực thành công!");
            }
          }
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Method to update current user data
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
      
      // Update user profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: userData.firstName,
          last_name: userData.lastName,
          avatar_url: userData.avatarUrl,
          bio: userData.bio,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id);
      
      if (error) {
        console.error('Error updating profile:', error);
        toast.error("Không thể cập nhật thông tin. " + error.message);
        setLoading(false);
        return false;
      }
      
      // Update local storage
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem('epu_user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      
      toast.success("Cập nhật thông tin thành công");
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Không thể cập nhật thông tin. Vui lòng thử lại sau.");
      setLoading(false);
      return false;
    }
  };

  // Password change method
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
      
      // Change password via Supabase
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        console.error('Error changing password:', error);
        toast.error(error.message || "Không thể thay đổi mật khẩu");
        setLoading(false);
        return false;
      }
      
      toast.success("Mật khẩu đã được thay đổi thành công");
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error((error as Error).message || "Không thể thay đổi mật khẩu");
      setLoading(false);
      return false;
    }
  };

  // Login with fixed account
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

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      if (!email || !password) {
        toast.error("Vui lòng nhập email và mật khẩu");
        setLoading(false);
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
        setLoading(false);
        return true;
      }
      
      // Try Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Login error:', error);
        toast.error(error.message || "Đăng nhập thất bại");
        setLoading(false);
        return false;
      }
      
      // Get user profile data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      const userData: User = {
        id: data.user.id,
        email: data.user.email || '',
        firstName: profileData?.first_name,
        lastName: profileData?.last_name,
        avatarUrl: profileData?.avatar_url,
        bio: profileData?.bio,
        email_confirmed_at: data.user.email_confirmed_at
      };
      
      localStorage.setItem('epu_user', JSON.stringify(userData));
      setCurrentUser(userData);
      
      toast.success("Đăng nhập thành công");
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error((error as Error).message || "Đăng nhập thất bại");
      setLoading(false);
      return false;
    }
  };

  // Signup function
  const signup = async (email: string, password: string, firstName: string, lastName: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Validate input
      if (!email || !password || !firstName || !lastName) {
        toast.error("Vui lòng điền đầy đủ thông tin");
        setLoading(false);
        return false;
      }
      
      if (password.length < 6) {
        toast.error("Mật khẩu phải có ít nhất 6 ký tự");
        setLoading(false);
        return false;
      }
      
      // Check if trying to register with fixed account email
      if (FIXED_ACCOUNT.email && email === FIXED_ACCOUNT.email) {
        toast.error("Email này đã được sử dụng");
        setLoading(false);
        return false;
      }
      
      // Register with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName
          }
        }
      });
      
      if (error) {
        console.error('Signup error:', error);
        toast.error(error.message || "Đăng ký thất bại");
        setLoading(false);
        return false;
      }
      
      toast.success("Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.");
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      toast.error((error as Error).message || "Đăng ký thất bại");
      setLoading(false);
      return false;
    }
  };

  // Logout function - show confirmation dialog
  const logout = () => {
    setShowLogoutConfirm(true);
  };

  // Perform actual logout
  const performLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('epu_user');
      setCurrentUser(null);
      navigate('/login');
      toast.info("Đã đăng xuất. Hẹn gặp lại bạn!");
    } catch (error) {
      console.error('Logout error:', error);
      toast.error("Đăng xuất thất bại. Vui lòng thử lại.");
    } finally {
      setShowLogoutConfirm(false);
    }
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
              Bạn có chắc chắn muốn đăng xuất không?
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
