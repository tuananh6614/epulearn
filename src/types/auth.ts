
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  bio?: string;
  isVip?: boolean;
  vipExpirationDate?: string | null;
  deleteRequested?: boolean;  // Add this property for delete account functionality
}

export interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<boolean>;
  isAuthenticated: boolean;
  showLogoutConfirm: boolean;
  setShowLogoutConfirm: (show: boolean) => void;
  updateCurrentUser: (data: Partial<User>) => Promise<boolean>;
  updateUserProfile: (data: Partial<User>) => Promise<boolean>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
  performLogout: () => Promise<void>;
  user: User | null;
}
