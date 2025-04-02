
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export function SecurityForm() {
  const { currentUser, changePassword, updateCurrentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validatePassword = () => {
    setPasswordError("");
    
    if (newPassword.length < 8) {
      setPasswordError("Mật khẩu phải có ít nhất 8 ký tự");
      return false;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError("Mật khẩu mới và xác nhận không khớp");
      return false;
    }
    
    return true;
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // First authenticate with current password
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: currentUser?.email || '',
        password: currentPassword,
      });
      
      if (authError) {
        toast.error("Mật khẩu hiện tại không chính xác");
        setIsLoading(false);
        return;
      }
      
      // Update password - calling changePassword with the correct number of arguments
      // The implementation in useAuthProvider expects both passwords
      const success = await changePassword(currentPassword, newPassword);
      
      if (!success) {
        toast.error("Không thể cập nhật mật khẩu");
      } else {
        toast.success("Mật khẩu đã được cập nhật thành công");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      console.error("Password update error:", error);
      toast.error("Đã xảy ra lỗi khi cập nhật mật khẩu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    
    try {
      // Update user with deleteRequested flag
      const success = await updateCurrentUser({
        deleteRequested: true
      });
      
      if (success) {
        toast.success("Tài khoản đã được yêu cầu xóa");
      } else {
        toast.error("Không thể xóa tài khoản");
      }
    } catch (error) {
      console.error("Delete account error:", error);
      toast.error("Đã xảy ra lỗi khi xóa tài khoản");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bảo mật</CardTitle>
        <CardDescription>
          Quản lý mật khẩu và bảo mật tài khoản của bạn
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Mật khẩu hiện tại</Label>
            <Input 
              id="current-password" 
              type="password" 
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="new-password">Mật khẩu mới</Label>
            <Input 
              id="new-password" 
              type="password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Xác nhận mật khẩu mới</Label>
            <Input 
              id="confirm-password" 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {passwordError && (
              <p className="text-sm text-red-500 mt-1">{passwordError}</p>
            )}
          </div>
          
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
          </Button>
        </form>
        
        <div className="border-t pt-6">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Xóa tài khoản</h3>
            <p className="text-sm text-muted-foreground">
              Khi bạn xóa tài khoản, tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn.
              Hành động này không thể hoàn tác.
            </p>
          </div>
          <Button 
            variant="destructive" 
            className="mt-4" 
            onClick={handleDeleteAccount}
            disabled={isLoading}
          >
            {isLoading ? "Đang xử lý..." : "Xóa tài khoản"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
