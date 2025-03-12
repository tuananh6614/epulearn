
import React, { useState } from 'react';
import { Upload, Crown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { supabase } from "@/integrations/supabase/client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface UserAvatarProps {
  avatarUrl: string | null;
  firstName?: string;
  lastName?: string;
  size?: 'sm' | 'md' | 'lg';
  editable?: boolean;
  showVipStatus?: boolean;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ 
  avatarUrl, 
  firstName, 
  lastName, 
  size = 'md',
  editable = false,
  showVipStatus = true
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const { updateCurrentUser, currentUser } = useAuth();
  
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  // Kiểm tra trạng thái VIP và ngày hết hạn
  const isVip = currentUser?.isVip || false;
  const vipExpirationDate = currentUser?.vipExpirationDate ? new Date(currentUser.vipExpirationDate) : null;
  
  // Tính số ngày còn lại của gói VIP
  const remainingDays = vipExpirationDate ? 
    Math.ceil((vipExpirationDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : null;
  
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 5MB");
      return;
    }
    
    if (!file.type.match('image.*')) {
      toast.error("Chỉ chấp nhận file hình ảnh");
      return;
    }
    
    setIsUploading(true);
    
    try {
      if (!currentUser) {
        toast.error("Bạn cần đăng nhập để tải lên ảnh đại diện");
        return;
      }
      
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${currentUser.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `avatars/${fileName}`;
        
        const { data, error } = await supabase.storage
          .from('avatars')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          });
          
        if (error) {
          throw error;
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
          
        await updateCurrentUser({ avatarUrl: publicUrl });
        
        toast.success("Ảnh đại diện đã được cập nhật");
      } catch (error) {
        console.error('Error uploading avatar:', error);
        toast.error("Không thể tải lên ảnh đại diện. Vui lòng thử lại sau.");
      }
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
      
      {showVipStatus && isVip && remainingDays && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full p-1 animate-pulse">
                <Crown className={`${size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'} text-white`} />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Thành viên VIP - còn {remainingDays} ngày</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      
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
