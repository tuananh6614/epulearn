
// Mock client to replace Supabase client
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
export const localStorage = {
  uploadFile: async (path: string, file: File) => {
    console.log(`[MOCK] Uploading file to ${path}`);
    return { url: URL.createObjectURL(file), error: null };
  },
  getPublicUrl: (path: string) => {
    return { url: `/mock-storage/${path}` };
  },
  deleteFile: async (path: string) => {
    console.log(`[MOCK] Deleting file from ${path}`);
    return { success: true, error: null };
  }
};

export default {
  checkVipAccess,
  localStorage
};
