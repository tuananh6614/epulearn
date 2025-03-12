
import { User } from "@/types/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';

// Fixed account for demo purposes
export const FIXED_ACCOUNT = {
  id: "demo-user-1",
  email: "demo@example.com",
  firstName: "Demo",
  lastName: "User",
  password: "password123"
};

// Fetch user profile from Supabase
export const fetchUserProfile = async (userId: string, userEmail: string, emailConfirmedAt: string | null): Promise<User | null> => {
  try {
    const { data: profileData, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
        
    if (profileData) {
      const userData: User = {
        id: userId,
        email: userEmail,
        firstName: profileData.first_name,
        lastName: profileData.last_name,
        avatarUrl: profileData.avatar_url,
        bio: profileData.bio,
        email_confirmed_at: emailConfirmedAt,
        isVip: profileData.is_vip || false,
        vipExpirationDate: profileData.vip_expiration_date
      };
      
      if (userData.vipExpirationDate) {
        const now = new Date();
        const expirationDate = new Date(userData.vipExpirationDate);
        
        if (expirationDate <= now && userData.isVip) {
          await supabase
            .from('profiles')
            .update({ 
              is_vip: false,
              vip_expiration_date: null
            })
            .eq('id', userId);
            
          userData.isVip = false;
          userData.vipExpirationDate = null;
        }
      }
      
      localStorage.setItem('epu_user', JSON.stringify(userData));
      return userData;
    } else if (error) {
      console.warn('Error fetching profile:', error);
      const userData: User = {
        id: userId,
        email: userEmail,
        email_confirmed_at: emailConfirmedAt
      };
      
      localStorage.setItem('epu_user', JSON.stringify(userData));
      return userData;
    }
  } catch (error) {
    console.error('Profile fetch error:', error);
  }
  
  return null;
};

// Handle auth state change
export const handleAuthStateChange = async (event: string, session: any, setCurrentUser: (user: User | null) => void): Promise<void> => {
  console.log('Auth state changed:', event);
  
  if (event === 'SIGNED_IN' && session) {
    const userData = await fetchUserProfile(session.user.id, session.user.email || '', session.user.email_confirmed_at);
    if (userData) {
      setCurrentUser(userData);
    }
    
    if (session.user.email_confirmed_at) {
      toast.success("Email của bạn đã được xác thực thành công!");
    }
  } else if (event === 'SIGNED_OUT') {
    setCurrentUser(null);
    localStorage.removeItem('epu_user');
  } else if (event === 'USER_UPDATED' && session) {
    setCurrentUser(prevUser => 
      prevUser ? {
        ...prevUser,
        email_confirmed_at: session.user.email_confirmed_at
      } : null
    );
    
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
    
    if (session.user.email_confirmed_at) {
      toast.success("Email của bạn đã được xác thực thành công!");
    }
  }
};

// Parse auth error from URL
export const parseAuthErrorFromURL = (): { message: string | null; errorType: string | null; errorCode: string | null } => {
  const hash = window.location.hash;
  if (hash.includes('error=') && hash.includes('error_code=')) {
    const errorParams = new URLSearchParams(hash.substring(1));
    const errorType = errorParams.get('error');
    const errorCode = errorParams.get('error_code');
    const errorDescription = errorParams.get('error_description');
    
    let message = 'Lỗi xác thực';
    
    if (errorCode === 'otp_expired') {
      message = 'Liên kết email đã hết hạn. Vui lòng yêu cầu gửi lại email xác thực.';
    } else if (errorDescription) {
      message = errorDescription.replace(/\+/g, ' ');
    }
    
    return { message, errorType, errorCode };
  }
  
  return { message: null, errorType: null, errorCode: null };
};
