
import React, { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input"; 
import { Label } from "@/components/ui/label"; 
import { Upload, Pencil, Trash, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { supabaseStorage } from "@/integrations/supabase/client"; 

interface UserAvatarProps {
  size?: "sm" | "md" | "lg";
  showEditButton?: boolean;
  userId?: string;
  userImage?: string | null;
}

export function UserAvatar({ 
  size = "md", 
  showEditButton = false, 
  userId, 
  userImage 
}: UserAvatarProps) {
  const { currentUser, updateCurrentUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-20 w-20",
  };
  
  // Create a typed user object and handle possible missing email
  const user = userId ? { id: userId, avatarUrl: userImage } : currentUser;
  const avatarUrl = user?.avatarUrl || currentUser?.avatarUrl || filePreview;
  
  // Safely get initials, checking if email exists
  const getInitials = (): string => {
    if (currentUser?.email) {
      return currentUser.email.substring(0, 2).toUpperCase();
    }
    
    if (user && 'email' in user && user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    
    return "U";
  };
  
  const initials = getInitials();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
    }
  };
  
  const uploadAvatar = async () => {
    if (!selectedFile || !user?.id) return;
    
    setIsUploading(true);
    
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const filePath = `avatars/${user.id}/avatar.${fileExt}`;
      
      // Upload file to Supabase Storage
      const { data, error } = await supabaseStorage
        .from('user-avatars')
        .upload(filePath, selectedFile);
        
      if (error) throw error;
      
      // Get the public URL
      const { data: { publicUrl } } = supabaseStorage
        .from('user-avatars')
        .getPublicUrl(filePath);
      
      // Update user profile with avatar URL
      const updated = await updateCurrentUser({
        avatarUrl: publicUrl
      });
      
      if (updated) {
        toast.success("Avatar updated successfully");
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error("Failed to update avatar");
    } finally {
      setIsUploading(false);
    }
  };
  
  const removeAvatar = async () => {
    if (!user?.id) return;
    
    setIsUploading(true);
    
    try {
      // Update user profile to remove avatar URL
      const updated = await updateCurrentUser({
        avatarUrl: null
      });
      
      if (updated) {
        toast.success("Avatar removed");
        setIsDialogOpen(false);
        setFilePreview(null);
      }
    } catch (error) {
      console.error('Error removing avatar:', error);
      toast.error("Failed to remove avatar");
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="relative">
      <Avatar className={sizeClasses[size]}>
        {avatarUrl ? (
          <AvatarImage src={avatarUrl} alt="Avatar" className="object-cover" />
        ) : (
          <AvatarFallback>{initials}</AvatarFallback>
        )}
      </Avatar>
      
      {showEditButton && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className="absolute bottom-0 right-0 size-6 rounded-full shadow-md bg-popover hover:bg-secondary"
            >
              <Pencil className="h-3 w-3" />
              <span className="sr-only">Edit avatar</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Avatar</DialogTitle>
              <DialogDescription>
                Upload a new avatar or remove the current one.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="picture" className="text-right">
                  New picture
                </Label>
                <Input
                  type="file"
                  id="picture"
                  className="col-span-3"
                  onChange={handleFileChange}
                />
              </div>
              {filePreview && (
                <div className="flex justify-center">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={filePreview} alt="Preview" className="object-cover" />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={removeAvatar} disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait
                  </>
                ) : (
                  <>
                    <Trash className="mr-2 h-4 w-4" />
                    Remove
                  </>
                )}
              </Button>
              <Button type="submit" onClick={uploadAvatar} disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
