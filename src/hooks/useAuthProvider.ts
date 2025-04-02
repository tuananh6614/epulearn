
import { useState, useEffect, useCallback } from 'react';
import { User, AuthContextType } from '@/types/auth';
import { toast } from 'sonner';

// Mock user data for demo purposes
const DEMO_USER: User = {
  id: "demo-user-1",
  email: "demo@example.com",
  firstName: "Demo",
  lastName: "User",
  avatarUrl: "https://ui-avatars.com/api/?name=Demo+User&background=random",
  email_confirmed_at: new Date().toISOString(),
  isVip: false
};

// Store the password for the demo user - in a real app, passwords would never be stored like this
const DEMO_PASSWORD = "password123";

export default function useAuthProvider(): AuthContextType {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState<boolean>(false);

  // Get the user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem('epu_user');
        if (storedUser) {
          const user = JSON.parse(storedUser) as User;
          console.log("Loaded user from localStorage:", user.email);
          setCurrentUser(user);
        } else {
          console.log("No user found in localStorage");
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("Error loading user:", error);
        localStorage.removeItem('epu_user');
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Simulated login function
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      console.log("Login attempt with email:", email);

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if the email and password match our demo user
      if (email.toLowerCase() === DEMO_USER.email && password === DEMO_PASSWORD) {
        console.log("Login successful");
        
        // Create a new user object with current timestamp
        const user: User = {
          ...DEMO_USER,
          // Add additional properties if needed
        };

        // Save the user to localStorage
        localStorage.setItem('epu_user', JSON.stringify(user));
        setCurrentUser(user);
        return true;
      } else {
        console.log("Login failed: incorrect credentials");
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Simulated logout function
  const logout = useCallback(() => {
    console.log("Logout requested");
    setShowLogoutConfirm(true);
  }, []);

  // Actual logout implementation
  const performLogout = useCallback(async () => {
    try {
      console.log("Performing logout");
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Clear user data
      localStorage.removeItem('epu_user');
      setCurrentUser(null);
      setShowLogoutConfirm(false);
      
      toast.success("Đăng xuất thành công!");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Đăng xuất thất bại. Vui lòng thử lại.");
    }
  }, []);

  // Simulated signup function
  const signup = useCallback(async (
    email: string, 
    password: string,
    firstName: string,
    lastName: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      console.log("Sign-up attempt with email:", email);

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // In a real app, we would create a new user in the backend
      // For now, just pretend we created a user and notify that verification is needed
      console.log("Sign-up successful");
      toast.success("Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.");
      
      return true;
    } catch (error) {
      console.error("Sign-up error:", error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Simulated update user function
  const updateCurrentUser = useCallback(async (userData: Partial<User>): Promise<boolean> => {
    try {
      if (!currentUser) {
        console.error("Cannot update user: No user is logged in");
        return false;
      }

      console.log("Updating user data:", userData);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update the current user with the new data
      const updatedUser: User = {
        ...currentUser,
        ...userData
      };
      
      localStorage.setItem('epu_user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      
      toast.success("Cập nhật thông tin thành công!");
      return true;
    } catch (error) {
      console.error("Update user error:", error);
      return false;
    }
  }, [currentUser]);

  // Simulated change password function
  const changePassword = useCallback(async (oldPassword: string, newPassword: string): Promise<boolean> => {
    try {
      if (!currentUser) {
        console.error("Cannot change password: No user is logged in");
        return false;
      }
      
      console.log("Changing password");
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, we would verify the old password and update with the new one
      if (oldPassword === DEMO_PASSWORD) {
        // For demo purposes, we don't actually change the stored password
        toast.success("Mật khẩu đã được cập nhật thành công!");
        return true;
      } else {
        toast.error("Mật khẩu hiện tại không chính xác");
        return false;
      }
    } catch (error) {
      console.error("Change password error:", error);
      return false;
    }
  }, [currentUser]);

  // Simulated resend verification email function
  const resendVerificationEmail = useCallback(async (): Promise<boolean> => {
    try {
      if (!currentUser) {
        console.error("Cannot resend verification email: No user is logged in");
        return false;
      }
      
      console.log("Resending verification email to:", currentUser.email);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Email xác thực đã được gửi lại!");
      return true;
    } catch (error) {
      console.error("Resend verification email error:", error);
      return false;
    }
  }, [currentUser]);

  return {
    currentUser,
    loading,
    login,
    logout,
    signup,
    isAuthenticated: !!currentUser,
    showLogoutConfirm,
    setShowLogoutConfirm,
    updateCurrentUser,
    changePassword,
    resendVerificationEmail,
    performLogout,
    user: currentUser
  };
}
