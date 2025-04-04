
import { useState, useEffect, useCallback } from 'react';
import { User } from '@/types/auth';
import { toast } from 'sonner';

// Mock user database
const mockUsers = [
  { 
    id: 'demo-user-1', 
    email: 'demo@example.com', 
    firstName: 'Demo',
    lastName: 'User',
    password: 'password',
    isVip: true,
    vipExpirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    avatarUrl: '/placeholder.svg',
    bio: 'This is a demo user'
  }
];

const useAuthProvider = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // Check for user in localStorage on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setCurrentUser(parsedUser);
        } else {
          console.info('No user found in localStorage');
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // Login handler
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      // Find the user in our mock database
      const user = mockUsers.find(u => u.email === email && u.password === password);
      
      if (user) {
        const { password, ...userWithoutPassword } = user;
        setCurrentUser(userWithoutPassword);
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Đăng nhập thất bại');
      return false;
    }
  }, []);
  
  // Signup handler
  const signup = useCallback(async (email: string, password: string, firstName: string, lastName: string): Promise<boolean> => {
    try {
      // Check if the user already exists
      if (mockUsers.some(u => u.email === email)) {
        toast.error('Email đã được sử dụng');
        return false;
      }
      
      // Create a new user
      const newUser = {
        id: `user-${Date.now()}`,
        email,
        firstName,
        lastName,
        isVip: false,
        vipExpirationDate: null,
        avatarUrl: null,
        bio: null,
        password
      };
      
      mockUsers.push(newUser);
      
      const { password: _, ...userWithoutPassword } = newUser;
      setCurrentUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Đăng ký thất bại');
      return false;
    }
  }, []);
  
  // Logout confirmation
  const logout = useCallback(() => {
    setShowLogoutConfirm(true);
  }, []);
  
  // Perform logout
  const performLogout = useCallback(async () => {
    try {
      localStorage.removeItem('user');
      setCurrentUser(null);
      setShowLogoutConfirm(false);
      toast.success('Đăng xuất thành công');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Đăng xuất thất bại');
    }
  }, []);
  
  // Update current user
  const updateCurrentUser = useCallback(async (data: Partial<User>): Promise<boolean> => {
    try {
      if (!currentUser) return false;
      
      const updatedUser = { ...currentUser, ...data };
      setCurrentUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Update the mock user in the database
      const userIndex = mockUsers.findIndex(u => u.id === currentUser.id);
      if (userIndex >= 0) {
        mockUsers[userIndex] = { ...mockUsers[userIndex], ...data };
      }
      
      return true;
    } catch (error) {
      console.error('Update user error:', error);
      return false;
    }
  }, [currentUser]);
  
  // Update user profile
  const updateUserProfile = useCallback(async (data: Partial<User>): Promise<boolean> => {
    try {
      return await updateCurrentUser(data);
    } catch (error) {
      console.error('Update profile error:', error);
      return false;
    }
  }, [updateCurrentUser]);
  
  // Change password
  const changePassword = useCallback(async (oldPassword: string, newPassword: string): Promise<boolean> => {
    try {
      if (!currentUser) return false;
      
      // Find the user in our mock database
      const userIndex = mockUsers.findIndex(u => u.id === currentUser.id);
      if (userIndex >= 0) {
        if (mockUsers[userIndex].password !== oldPassword) {
          toast.error('Mật khẩu hiện tại không chính xác');
          return false;
        }
        
        mockUsers[userIndex].password = newPassword;
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Change password error:', error);
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
    updateUserProfile,
    changePassword,
    performLogout,
    user: currentUser,
  };
};

export default useAuthProvider;
