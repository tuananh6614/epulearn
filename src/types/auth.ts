
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  lastNameChanged?: string;
  avatarUrl?: string;
  bio?: string;
  email_confirmed_at?: string | null;
  isVip?: boolean;
  vipExpirationDate?: string | null;
}

export interface FixedAccount extends User {
  password: string;
}

export interface AuthContextType {
  currentUser: User | null;
  user: User | null;
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
  resendVerificationEmail: () => Promise<boolean>;
}
