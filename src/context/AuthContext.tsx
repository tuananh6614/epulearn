
import React, { createContext, useContext, useEffect } from 'react';
import useAuthProvider from '@/hooks/useAuthProvider';
import { AuthContextType } from '@/types/auth';
import LogoutConfirmDialog from '@/components/LogoutConfirmDialog';
import { clearLocalCache } from '@/lib/utils';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuthProvider();
  
  // Clear local cache when auth state changes
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Only persist cache for authenticated users
      if (!auth.currentUser) {
        clearLocalCache();
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [auth.currentUser]);
  
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
