
import React, { createContext, useContext } from 'react';
import useAuthProvider from '@/hooks/useAuthProvider';
import { AuthContextType } from '@/types/auth';
import LogoutConfirmDialog from '@/components/LogoutConfirmDialog';

// Create the context with a default value
export const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  login: async () => false,
  logout: () => {},
  signup: async () => false,
  isAuthenticated: false,
  showLogoutConfirm: false,
  setShowLogoutConfirm: () => {},
  updateCurrentUser: async () => false,
  updateUserProfile: async () => false, // Include in the default value
  changePassword: async () => false,
  resendVerificationEmail: async () => false,
  performLogout: async () => {},
  user: null
});

// Create a provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuthProvider();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
      <LogoutConfirmDialog
        open={auth.showLogoutConfirm}
        onOpenChange={auth.setShowLogoutConfirm}
        onConfirm={auth.performLogout}
      />
    </AuthContext.Provider>
  );
};

// Create a hook to use the auth context
export const useAuth = () => useContext(AuthContext);
