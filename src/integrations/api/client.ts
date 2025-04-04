
// Mock API client to replace Supabase

export interface VipStatus {
  isVip: boolean;
  daysRemaining: number | null;
}

// Check user's VIP status (mock function)
export const checkVipAccess = async (userId: string): Promise<VipStatus> => {
  console.log(`[MOCK] Checking VIP access for user ${userId}`);
  // Mock VIP users
  const mockVipUsers = ['demo-user-1'];
  const isVip = mockVipUsers.includes(userId);
  
  return {
    isVip,
    daysRemaining: isVip ? 30 : null
  };
};

// Mock storage functionality
export const storage = {
  from: (bucket: string) => ({
    upload: async (path: string, file: File) => {
      console.log(`[MOCK] Uploading file to ${bucket}/${path}`);
      return { data: { path }, error: null };
    },
    getPublicUrl: (path: string) => {
      return { data: { publicUrl: `/mock-storage/${path}` } };
    }
  })
};

// Mock API methods
export const api = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    signInWithPassword: async (credentials: { email: string; password: string }) => {
      console.log('[MOCK] Sign in with:', credentials.email);
      
      if (credentials.email === 'demo@example.com' && credentials.password === 'password') {
        return { 
          data: { 
            user: { 
              id: 'demo-user-1',
              email: credentials.email
            },
            session: {
              access_token: 'mock-token'
            }
          }, 
          error: null 
        };
      }
      
      return { data: null, error: { message: 'Invalid login credentials' } };
    },
    signUp: async (credentials: { email: string; password: string; }) => {
      console.log('[MOCK] Sign up with:', credentials.email);
      return { 
        data: { 
          user: { 
            id: 'new-user-' + Date.now(),
            email: credentials.email
          }
        }, 
        error: null 
      };
    },
    signOut: async () => ({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    updateUser: async () => ({ data: {}, error: null })
  },
  
  // Generic data methods
  from: (table: string) => ({
    select: (...columns: string[]) => ({
      eq: (field: string, value: any) => ({
        single: () => Promise.resolve({ data: {}, error: null }),
        maybeSingle: () => Promise.resolve({ data: {}, error: null }),
        data: [],
        error: null
      }),
      data: [],
      error: null
    }),
    insert: (data: any) => Promise.resolve({ data, error: null }),
    update: (data: any) => ({
      eq: (field: string, value: any) => Promise.resolve({ data, error: null })
    }),
    delete: () => ({
      eq: (field: string, value: any) => Promise.resolve({ error: null })
    })
  })
};

export default { api, storage, checkVipAccess };
