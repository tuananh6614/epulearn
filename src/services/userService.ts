
/**
 * Service for handling user profile operations with MySQL backend
 */

const API_URL = 'http://localhost:3000/api';

// Interface for user profile data
export interface UserProfile {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  bio?: string;
  password?: string; // Only used for password changes
}

// Get user profile
export const getUserProfile = async (userId: string): Promise<UserProfile> => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update user profile');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Change user password
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
      throw new Error('Failed to change password');
    }
    
    return true;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

// Get user certificates
export const getUserCertificates = async (userId: string): Promise<any[]> => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}/certificates`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch user certificates');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching user certificates:', error);
    return [];
  }
};

// Get user course progress
export const getUserCourseProgress = async (userId: string): Promise<any[]> => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}/progress`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch user progress');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching user progress:', error);
    return [];
  }
};
