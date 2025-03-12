
import React, { createContext, useContext } from 'react';
import useAuthProvider from '@/hooks/useAuthProvider';
import { AuthContextType } from '@/types/auth';
import LogoutConfirmDialog from '@/components/LogoutConfirmDialog';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
