
import { toast } from 'sonner';

// Base API URL
const API_URL = 'http://localhost:3000/api';

// User interface
interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  lastNameChanged?: string;
  avatarUrl?: string;
  bio?: string;
}

/**
 * Get user details from API
 */
export const getUserDetails = async (userId: string): Promise<User | null> => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch user details');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching user details:', error);
    return null;
  }
};

/**
 * Update user profile in the database
 */
export const updateUserProfile = async (userId: string, userData: Partial<User>): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      toast.error(errorData.message || "Cập nhật thông tin thất bại");
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    toast.error("Lỗi kết nối đến máy chủ. Vui lòng thử lại sau");
    return false;
  }
};

/**
 * Upload user avatar to the server
 */
export const uploadUserAvatar = async (userId: string, file: File): Promise<string | null> => {
  try {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await fetch(`${API_URL}/users/${userId}/avatar`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload avatar');
    }
    
    const data = await response.json();
    return data.avatarUrl;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    toast.error("Không thể tải lên ảnh đại diện. Vui lòng thử lại sau");
    return null;
  }
};

/**
 * Change user password
 */
export const changeUserPassword = async (
  userId: string, 
  currentPassword: string, 
  newPassword: string
): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      toast.error(errorData.message || "Thay đổi mật khẩu thất bại");
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error changing password:', error);
    toast.error("Lỗi kết nối đến máy chủ. Vui lòng thử lại sau");
    return false;
  }
};

/**
 * Get user courses from API
 */
export const getUserCourses = async (userId: string) => {
  try {
    const response = await fetch(`${API_URL}/user-courses/${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch user courses');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching user courses:', error);
    return [];
  }
};

/**
 * Get user certificates from API
 */
export const getUserCertificates = async (userId: string) => {
  try {
    const response = await fetch(`${API_URL}/user-certificates/${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch user certificates');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching user certificates:', error);
    return [];
  }
};

export default {
  getUserDetails,
  updateUserProfile,
  uploadUserAvatar,
  changeUserPassword,
  getUserCourses,
  getUserCertificates
};
