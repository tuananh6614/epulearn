
import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

interface UserAvatarProps {
  avatarUrl: string | null;
  firstName?: string;
  lastName?: string;
  size?: 'sm' | 'md' | 'lg';
  editable?: boolean;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ 
  avatarUrl, 
  firstName, 
  lastName, 
  size = 'md',
  editable = false 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const { updateCurrentUser } = useAuth();
  
  // Size class mapping
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };
  
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 5MB");
      return;
    }
    
    // Check file type
    if (!file.type.match('image.*')) {
      toast.error("Chỉ chấp nhận file hình ảnh");
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Create object URL for local preview without server
      const localImageUrl = URL.createObjectURL(file);
      
      try {
        // Try to upload to server first
        const formData = new FormData();
        formData.append('avatar', file);
        
        const API_URL = 'http://localhost:3000/api';
        
        const response = await fetch(`${API_URL}/upload-avatar`, {
          method: 'POST',
          body: formData,
          signal: AbortSignal.timeout(5000) // Reduce timeout to quickly detect connection issues
        });
        
        if (!response.ok) {
          throw new Error('Failed to upload avatar to server');
        }
        
        const data = await response.json();
        
        // Update user data in AuthContext with server URL
        await updateCurrentUser({ avatarUrl: data.avatarUrl });
        toast.success("Ảnh đại diện đã được cập nhật và đồng bộ với CSDL");
      } catch (error) {
        console.error('Error uploading avatar to server:', error);
        
        // Fall back to local URL if server upload fails
        await updateCurrentUser({ avatarUrl: localImageUrl });
        toast.warning("Không thể kết nối đến máy chủ. Ảnh đã được lưu cục bộ.");
      }
    } catch (error) {
      console.error('Error handling avatar upload:', error);
      toast.error("Không thể tải lên ảnh đại diện. Vui lòng thử lại sau.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`relative ${editable ? 'group' : ''} ${sizeClasses[size]}`}>
      <Avatar className={`${sizeClasses[size]}`}>
        <AvatarImage src={avatarUrl || undefined} alt={firstName && lastName ? `${firstName} ${lastName}` : 'User'} />
        <AvatarFallback className={size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-xl' : 'text-base'}>
          {firstName?.[0]}{lastName?.[0]}
        </AvatarFallback>
      </Avatar>
      
      {editable && (
        <div className="absolute bottom-0 right-0">
          <label htmlFor="avatar-upload" className="cursor-pointer">
            <div className="bg-primary text-white p-1.5 rounded-full hover:bg-primary/90 transition-colors">
              {isUploading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Upload className="h-4 w-4" />
              )}
            </div>
            <input 
              id="avatar-upload" 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleAvatarUpload}
              disabled={isUploading}
            />
          </label>
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
