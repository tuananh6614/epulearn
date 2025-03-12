import React, { useState, useEffect } from 'react';
import { Upload, Crown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { API_URL, fetchWithTimeout } from '@/services/apiUtils';
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
  const [isVip, setIsVip] = useState(false);
  const [vipExpirationDate, setVipExpirationDate] = useState<string | null>(null);
  const [remainingDays, setRemainingDays] = useState<number | null>(null);
  const { updateCurrentUser, currentUser } = useAuth();
  
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  useEffect(() => {
    const fetchVipStatus = async () => {
      if (!currentUser) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_vip, vip_expiration_date')
          .eq('id', currentUser.id)
          .single();
        
        if (error) {
          console.error('Error fetching VIP status:', error);
          return;
        }
        
        if (data) {
          const now = new Date();
          const expirationDate = data.vip_expiration_date ? new Date(data.vip_expiration_date) : null;
          
          if (expirationDate && expirationDate > now) {
            setIsVip(!!data.is_vip);
            setVipExpirationDate(data.vip_expiration_date);
            
            const timeDiff = expirationDate.getTime() - now.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
            setRemainingDays(daysDiff);
          } else {
            setIsVip(false);
            setRemainingDays(null);
            
            if (data.is_vip) {
              const { error: updateError } = await supabase
                .from('profiles')
                .update({ 
                  is_vip: false,
                  vip_expiration_date: null
                })
                .eq('id', currentUser.id);
              
              if (updateError) {
                console.error('Error updating expired VIP status:', updateError);
              }
            }
          }
        }
      } catch (err) {
        console.error('Error in fetchVipStatus:', err);
      }
    };
    
    fetchVipStatus();
  }, [currentUser]);
  
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
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: publicUrl })
          .eq('id', currentUser.id);
          
        if (updateError) {
          console.error('Error updating profile:', updateError);
        }
        
        toast.success("Ảnh đại diện đã được cập nhật");
      } catch (supabaseError) {
        console.error('Error uploading to Supabase:', supabaseError);
        
        const formData = new FormData();
        formData.append('avatar', file);
        
        const response = await fetchWithTimeout(`${API_URL}/upload-avatar`, {
          method: 'POST',
          body: formData,
        }, 8000);
        
        if (!response.ok) {
          throw new Error('Failed to upload avatar to server');
        }
        
        const data = await response.json();
        
        await updateCurrentUser({ avatarUrl: data.avatarUrl });
        toast.success("Ảnh đại diện đã được cập nhật và đồng bộ với CSDL");
      }
    } catch (error) {
      console.error('Error handling avatar upload:', error);
      
      const localImageUrl = URL.createObjectURL(file);
      await updateCurrentUser({ avatarUrl: localImageUrl });
      
      toast.warning("Không thể kết nối đến máy chủ. Ảnh đã được lưu cục bộ.");
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
      
      {showVipStatus && isVip && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full p-1">
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
