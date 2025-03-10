import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Lock, Eye, EyeOff } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// Schema for password change
const passwordFormSchema = z.object({
  currentPassword: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
  newPassword: z.string().min(6, { message: "Mật khẩu mới phải có ít nhất 6 ký tự" })
    .regex(/[A-Z]/, { message: "Mật khẩu phải chứa ít nhất một chữ hoa" })
    .regex(/[0-9]/, { message: "Mật khẩu phải chứa ít nhất một chữ số" }),
  confirmPassword: z.string().min(6, { message: "Xác nhận mật khẩu phải có ít nhất 6 ký tự" }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

const SecurityForm: React.FC = () => {
  const { currentUser, changePassword, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordChecked, setPasswordChecked] = useState(false);
  const [isCurrentPasswordValid, setIsCurrentPasswordValid] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  // Validate current password
  const checkCurrentPassword = async () => {
    const currentPassword = form.getValues("currentPassword");
    
    if (!currentPassword) {
      toast.error("Vui lòng nhập mật khẩu hiện tại");
      return;
    }
    
    setLoading(true);
    
    try {
      // For development/demo purposes - simulate password check
      // In production, you would use a real API call
      try {
        // Try to call the API
        const API_URL = 'http://localhost:3000/api';
        const response = await fetch(`${API_URL}/check-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: currentUser?.id,
            password: currentPassword
          }),
        });
        
        if (response.ok) {
          setIsCurrentPasswordValid(true);
          setPasswordChecked(true);
          toast.success("Mật khẩu chính xác");
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Mật khẩu không chính xác');
        }
      } catch (apiError) {
        console.error('API error checking password:', apiError);
        // For demo purposes, allow password check without a backend
        console.log('Using mock password validation');
        // For demo, accept any password with at least 6 characters
        if (currentPassword.length >= 6) {
          setIsCurrentPasswordValid(true);
          setPasswordChecked(true);
          toast.success("Mật khẩu chính xác (Chế độ demo)");
        } else {
          toast.error("Mật khẩu không chính xác (Chế độ demo)");
          setIsCurrentPasswordValid(false);
          setPasswordChecked(true);
        }
      }
    } catch (error) {
      console.error('Error checking password:', error);
      setIsCurrentPasswordValid(false);
      setPasswordChecked(true);
      toast.error((error as Error).message || "Mật khẩu không chính xác");
    } finally {
      setLoading(false);
    }
  };
  
  // Handle password change
  const onSubmit = async (values: PasswordFormValues) => {
    if (!passwordChecked || !isCurrentPasswordValid) {
      toast.error("Vui lòng kiểm tra mật khẩu hiện tại trước");
      return;
    }
    
    setLoading(true);
    
    try {
      const success = await changePassword(values.currentPassword, values.newPassword);
      
      if (success) {
        toast.success("Mật khẩu đã được cập nhật thành công. Vui lòng đăng nhập lại.");
        
        // Clear form
        form.reset();
        setPasswordChecked(false);
        setIsCurrentPasswordValid(false);
        
        // Logout and redirect to login page after a short delay
        setTimeout(() => {
          logout();
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Lỗi thay đổi mật khẩu");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <h2 className="text-xl font-semibold mb-6 flex items-center">
        <Lock className="h-5 w-5 mr-2 text-blue-500" />
        Thay đổi mật khẩu
      </h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-1">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu hiện tại</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input 
                        type={showCurrentPassword ? "text" : "password"} 
                        placeholder="••••••" 
                        {...field} 
                        disabled={passwordChecked && isCurrentPasswordValid}
                        className={passwordChecked ? (isCurrentPasswordValid ? "border-green-500" : "border-red-500") : ""}
                      />
                    </FormControl>
                    <button 
                      type="button" 
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showCurrentPassword ? 
                        <EyeOff className="h-4 w-4 text-gray-500" /> : 
                        <Eye className="h-4 w-4 text-gray-500" />}
                    </button>
                  </div>
                  <FormMessage />
                  <div className="flex justify-end mt-1">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={checkCurrentPassword}
                      disabled={loading || (passwordChecked && isCurrentPasswordValid)}
                    >
                      {passwordChecked && isCurrentPasswordValid ? "Đã xác nhận" : "Kiểm tra mật khẩu"}
                    </Button>
                  </div>
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mật khẩu mới</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input 
                      type={showNewPassword ? "text" : "password"} 
                      placeholder="••••••" 
                      {...field} 
                      disabled={!passwordChecked || !isCurrentPasswordValid}
                    />
                  </FormControl>
                  <button 
                    type="button" 
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showNewPassword ? 
                      <EyeOff className="h-4 w-4 text-gray-500" /> : 
                      <Eye className="h-4 w-4 text-gray-500" />}
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Xác nhận mật khẩu</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input 
                      type={showConfirmPassword ? "text" : "password"} 
                      placeholder="••••••" 
                      {...field} 
                      disabled={!passwordChecked || !isCurrentPasswordValid}
                    />
                  </FormControl>
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showConfirmPassword ? 
                      <EyeOff className="h-4 w-4 text-gray-500" /> : 
                      <Eye className="h-4 w-4 text-gray-500" />}
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            disabled={loading || !passwordChecked || !isCurrentPasswordValid}
          >
            {loading ? "Đang cập nhật..." : "Thay đổi mật khẩu"}
          </Button>
        </form>
      </Form>
    </>
  );
};

export default SecurityForm;
