
// Mock Supabase client
// This file provides mock implementations for components that still reference Supabase

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

// Mock Supabase client
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
    select: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: null }),
        order: () => ({
          limit: () => ({
            data: [],
            error: null
          })
        })
      }),
      match: () => ({
        order: () => ({
          data: [],
          error: null
        })
      }),
      order: () => ({
        data: [],
        error: null
      }),
      data: [],
      error: null
    }),
    insert: async () => ({ data: {}, error: null }),
    update: async () => ({ data: {}, error: null }),
    upsert: async () => ({ data: {}, error: null }),
    delete: async () => ({ data: {}, error: null })
  }),
  storage: supabaseStorage,
  rpc: async () => ({ data: null, error: null })
};

export default supabase;
