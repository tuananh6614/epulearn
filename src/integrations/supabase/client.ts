
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

// Helper function to create a promise result
const createMockPromiseResult = (data: any = {}, error: any = null) => {
  return Promise.resolve({ data, error });
};

// Mock Supabase client with improved and fixed methods
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
      
      // Return an object with full chain methods
      const returnObj = {
        eq: (field: string, value: any) => {
          console.log(`[MOCK] eq ${field}=${value}`);
          return {
            single: () => createMockPromiseResult(),
            maybeSingle: () => createMockPromiseResult(),
            order: (...orderArgs: any[]) => ({
              limit: (limit: number) => createMockPromiseResult([]),
              data: [],
              error: null
            }),
            limit: (limit: number) => createMockPromiseResult([]),
            eq: (field2: string, value2: any) => returnObj.eq(field2, value2),
            data: [],
            error: null
          };
        },
        in: (field: string, values: any[]) => {
          console.log(`[MOCK] in ${field}`, values);
          return {
            order: (...orderArgs: any[]) => ({
              data: [],
              error: null,
              limit: (limit: number) => createMockPromiseResult([])
            }),
            limit: (limit: number) => createMockPromiseResult([]),
            data: [],
            error: null
          };
        },
        match: (conditions: any) => {
          console.log(`[MOCK] match`, conditions);
          return {
            order: (...orderArgs: any[]) => ({
              data: [],
              error: null,
              limit: (limit: number) => createMockPromiseResult([])
            }),
            limit: (limit: number) => createMockPromiseResult([]),
            data: [],
            error: null
          };
        },
        order: (...orderArgs: any[]) => {
          console.log(`[MOCK] order`, orderArgs);
          return {
            limit: (limit: number) => createMockPromiseResult([]),
            eq: (field: string, value: any) => returnObj.eq(field, value),
            data: [],
            error: null
          };
        },
        limit: (limit: number) => {
          console.log(`[MOCK] limit ${limit}`);
          return createMockPromiseResult([]);
        },
        single: () => createMockPromiseResult(),
        maybeSingle: () => createMockPromiseResult(),
        data: [],
        error: null
      };
      
      return returnObj;
    },
    insert: (data: any) => {
      console.log(`[MOCK] insert into ${table}`, data);
      const returnObj = {
        select: (...selectArgs: any[]) => createMockPromiseResult({}),
        eq: (field: string, value: any) => returnObj,
      };
      return returnObj;
    },
    update: (data: any) => {
      console.log(`[MOCK] update ${table}`, data);
      const returnObj = {
        eq: (field: string, value: any) => {
          console.log(`[MOCK] eq ${field}=${value}`);
          return returnObj;
        },
        match: (conditions: any) => returnObj,
        select: (...args: any[]) => createMockPromiseResult({})
      };
      return returnObj;
    },
    upsert: (data: any) => {
      console.log(`[MOCK] upsert ${table}`, data);
      const returnObj = {
        eq: (field: string, value: any) => {
          console.log(`[MOCK] eq ${field}=${value}`);
          return returnObj;
        },
        select: (...args: any[]) => createMockPromiseResult({})
      };
      return returnObj;
    },
    delete: () => {
      console.log(`[MOCK] delete from ${table}`);
      const returnObj = {
        eq: (field: string, value: any) => {
          console.log(`[MOCK] eq ${field}=${value}`);
          return returnObj;
        },
        match: (conditions: any) => returnObj
      };
      return returnObj;
    }
  }),
  storage: supabaseStorage,
  rpc: async (...args: any[]) => {
    console.log(`[MOCK] rpc`, args);
    return { data: null, error: null };
  }
};

export default supabase;
