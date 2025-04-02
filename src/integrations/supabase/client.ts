
// Mock Supabase client
// This file provides mock implementations for components that still reference Supabase

export interface VipStatus {
  isVip: boolean;
  daysRemaining: number | null;
}

// Kiểm tra trạng thái VIP của người dùng (mock function)
export const checkVipAccess = async (userId: string): Promise<VipStatus> => {
  console.log(`[MOCK] Checking VIP access for user ${userId}`);
  // Giả lập người dùng VIP
  const mockVipUsers = ['demo-user-1'];
  const isVip = mockVipUsers.includes(userId);
  
  return {
    isVip,
    daysRemaining: isVip ? 30 : null
  };
};

// Mock storage functionality
export const supabaseStorage = {
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

// Mock Supabase client with improved methods to handle various argument patterns
export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    signInWithPassword: async () => ({ data: {}, error: null }),
    signUp: async () => ({ data: {}, error: null }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    updateUser: async () => ({ data: {}, error: null })
  },
  from: (table: string) => ({
    select: (...args: any[]) => {
      console.log(`[MOCK] select from ${table}`, args);
      return {
        eq: (field: string, value: any) => {
          console.log(`[MOCK] eq ${field}=${value}`);
          return {
            single: async () => ({ data: null, error: null }),
            order: (...args: any[]) => ({
              limit: (limit: number) => ({
                data: [],
                error: null
              })
            })
          };
        },
        in: (field: string, values: any[]) => {
          console.log(`[MOCK] in ${field}`, values);
          return {
            order: (...args: any[]) => ({
              data: [],
              error: null
            })
          };
        },
        match: (conditions: any) => {
          console.log(`[MOCK] match`, conditions);
          return {
            order: (...args: any[]) => ({
              data: [],
              error: null
            })
          };
        },
        order: (...args: any[]) => {
          console.log(`[MOCK] order`, args);
          return {
            limit: (limit: number) => ({
              data: [],
              error: null
            }),
            data: [],
            error: null
          };
        },
        limit: (limit: number) => {
          console.log(`[MOCK] limit ${limit}`);
          return {
            data: [],
            error: null
          };
        },
        data: [],
        error: null
      };
    },
    insert: async (...args: any[]) => {
      console.log(`[MOCK] insert into ${table}`, args);
      return { data: {}, error: null };
    },
    update: async (...args: any[]) => {
      console.log(`[MOCK] update ${table}`, args);
      return { data: {}, error: null };
    },
    upsert: async (...args: any[]) => {
      console.log(`[MOCK] upsert ${table}`, args);
      return { data: {}, error: null };
    },
    delete: async (...args: any[]) => {
      console.log(`[MOCK] delete from ${table}`, args);
      return { data: {}, error: null };
    }
  }),
  storage: supabaseStorage,
  rpc: async (...args: any[]) => {
    console.log(`[MOCK] rpc`, args);
    return { data: null, error: null };
  }
};

export default supabase;
