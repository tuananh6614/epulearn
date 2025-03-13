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

// Fetch user profile from Supabase with better error handling and debugging
export const fetchUserProfile = async (userId: string, userEmail: string, emailConfirmedAt: string | null): Promise<User | null> => {
  try {
    console.log(`Fetching profile for user ID: ${userId}, email: ${userEmail}`);
    
    const { data: profileData, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
        
    if (profileData) {
      console.log("Profile found:", profileData);
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
          console.log("VIP status expired, updating profile");
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
      
      console.log("Saving user to localStorage:", userData.email);
      localStorage.setItem('epu_user', JSON.stringify(userData));
      return userData;
    } else if (error) {
      console.warn('Error fetching profile:', error);
      
      // Check if this is a new user without a profile
      if (error.code === 'PGRST116') {
        console.log("Profile not found, attempting to create minimal user");
        
        // Try to create a profile for this user
        try {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              email: userEmail,
              first_name: '',
              last_name: ''
            });
            
          if (insertError) {
            console.error("Failed to create profile:", insertError);
          } else {
            console.log("Created new profile for user");
          }
        } catch (insertErr) {
          console.error("Error creating profile:", insertErr);
        }
      }
      
      // Create minimal user when profile fetch fails
      const userData: User = {
        id: userId,
        email: userEmail,
        email_confirmed_at: emailConfirmedAt
      };
      
      console.log("Creating minimal user data:", userData);
      localStorage.setItem('epu_user', JSON.stringify(userData));
      return userData;
    }
    
    console.warn("No profile data and no error - unexpected state");
    return null;
  } catch (error) {
    console.error('Profile fetch error:', error);
    // Return minimal user in case of errors to prevent login failures
    const fallbackUser: User = {
      id: userId,
      email: userEmail,
      email_confirmed_at: emailConfirmedAt
    };
    console.log("Using fallback user due to error:", fallbackUser);
    localStorage.setItem('epu_user', JSON.stringify(fallbackUser));
    return fallbackUser;
  }
};

// Handle auth state change with better error handling
export const handleAuthStateChange = async (event: string, session: any, setCurrentUser: (user: User | null) => void): Promise<void> => {
  console.log('Auth state changed:', event, session?.user?.email || 'no session');
  
  try {
    if (event === 'SIGNED_IN' && session) {
      console.log("User signed in, fetching profile");
      const userData = await fetchUserProfile(session.user.id, session.user.email || '', session.user.email_confirmed_at);
      if (userData) {
        setCurrentUser(userData);
      }
      
      if (session.user.email_confirmed_at) {
        toast.success("Email của bạn đã được xác thực thành công!");
      }
    } else if (event === 'SIGNED_OUT') {
      console.log("User signed out, clearing data");
      setCurrentUser(null);
      localStorage.removeItem('epu_user');
      // Clear all other related items
      localStorage.removeItem('epu_supabase_auth');
    } else if (event === 'USER_UPDATED' && session) {
      console.log("User updated");
      const storedUser = localStorage.getItem('epu_user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          const updatedUser: User = {
            ...parsedUser,
            email_confirmed_at: session.user.email_confirmed_at
          };
          setCurrentUser(updatedUser);
          localStorage.setItem('epu_user', JSON.stringify(updatedUser));
        } catch (error) {
          console.error('Failed to update user in localStorage', error);
          // Recover from parse error by fetching a fresh user profile
          const userData = await fetchUserProfile(session.user.id, session.user.email || '', session.user.email_confirmed_at);
          if (userData) {
            setCurrentUser(userData);
          }
        }
      }
      
      if (session.user.email_confirmed_at) {
        toast.success("Email của bạn đã được xác thực thành công!");
      }
    }
  } catch (error) {
    console.error("Auth state change error:", error);
    // Handle authentication errors so the user can still use the app
    if (event === 'SIGNED_OUT') {
      setCurrentUser(null);
      localStorage.removeItem('epu_user');
      localStorage.removeItem('epu_supabase_auth');
    }
  }
};

// Parse auth error from URL with improved error messages
export const parseAuthErrorFromURL = (): { message: string | null; errorType: string | null; errorCode: string | null } => {
  const hash = window.location.hash;
  if (hash.includes('error=') && hash.includes('error_code=')) {
    try {
      const errorParams = new URLSearchParams(hash.substring(1));
      const errorType = errorParams.get('error');
      const errorCode = errorParams.get('error_code');
      const errorDescription = errorParams.get('error_description');
      
      let message = 'Lỗi xác thực';
      
      if (errorCode === 'otp_expired') {
        message = 'Liên kết email đã hết hạn. Vui lòng yêu cầu gửi lại email xác thực.';
      } else if (errorCode === 'invalid_request') {
        message = 'Yêu cầu không hợp lệ. Vui lòng thử lại.';
      } else if (errorCode === 'server_error') {
        message = 'Lỗi máy chủ. Vui lòng thử lại sau.';
      } else if (errorDescription) {
        message = errorDescription.replace(/\+/g, ' ');
      }
      
      return { message, errorType, errorCode };
    } catch (error) {
      console.error('Error parsing auth error from URL:', error);
      return { 
        message: 'Đã xảy ra lỗi khi xử lý xác thực',
        errorType: null, 
        errorCode: null 
      };
    }
  }
  
  return { message: null, errorType: null, errorCode: null };
};
