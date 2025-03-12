
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";

// Schema for password change
const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, { message: "Vui lòng nhập mật khẩu hiện tại" }),
  newPassword: z.string().min(6, { message: "Mật khẩu mới phải có ít nhất 6 ký tự" })
    .regex(/[A-Z]/, { message: "Mật khẩu phải chứa ít nhất một chữ hoa" })
    .regex(/[0-9]/, { message: "Mật khẩu phải chứa ít nhất một chữ số" }),
  confirmPassword: z.string().min(1, { message: "Vui lòng xác nhận mật khẩu mới" }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

const SecurityForm: React.FC = () => {
  const { currentUser, changePassword, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [checkingPassword, setCheckingPassword] = useState(false);
  const [passwordChecked, setPasswordChecked] = useState(false);
  const [isCurrentPasswordValid, setIsCurrentPasswordValid] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'none' | 'syncing' | 'synced' | 'error'>('none');
  const navigate = useNavigate();
  
  // Check if email is unverified
  const isEmailUnverified = currentUser?.email_confirmed_at === undefined || currentUser?.email_confirmed_at === null;
  
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  // Check current password directly with Supabase
  const checkCurrentPassword = async () => {
    const currentPassword = form.getValues("currentPassword");
    
    if (!currentPassword) {
      toast.error("Vui lòng nhập mật khẩu hiện tại");
      return;
    }
    
    setCheckingPassword(true);
    
    try {
      // Perform a sign-in with current credentials to verify password
      // This is a workaround since Supabase doesn't have a direct "verify password" endpoint
      const { error } = await supabase.auth.signInWithPassword({
        email: currentUser?.email || '',
        password: currentPassword
      });
      
      if (error) {
        throw new Error("Mật khẩu không chính xác");
      }
      
      setIsCurrentPasswordValid(true);
      setPasswordChecked(true);
      toast.success("Mật khẩu chính xác");
    } catch (error) {
      console.error('Error checking password:', error);
      setIsCurrentPasswordValid(false);
      setPasswordChecked(true);
      toast.error((error as Error).message || "Mật khẩu không chính xác");
    } finally {
      setCheckingPassword(false);
    }
  };
  
  // Handle password change
  const onSubmit = async (values: PasswordFormValues) => {
    if (!passwordChecked || !isCurrentPasswordValid) {
      toast.error("Vui lòng kiểm tra mật khẩu hiện tại trước");
      return;
    }
    
    if (isEmailUnverified) {
      toast.error("Bạn cần xác thực email trước khi thay đổi mật khẩu");
      return;
    }
    
    setLoading(true);
    setSyncStatus('syncing');
    
    try {
      const success = await changePassword(values.currentPassword, values.newPassword);
      
      if (success) {
        setSyncStatus('synced');
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
      } else {
        setSyncStatus('error');
        throw new Error("Cập nhật mật khẩu thất bại");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error((error as Error).message || "Lỗi thay đổi mật khẩu");
      setSyncStatus('error');
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
      
      {isEmailUnverified && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-md">
          <h3 className="text-amber-800 font-medium mb-2 flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Cần xác thực email
          </h3>
          <p className="text-amber-700 text-sm">
            Bạn cần xác thực email trước khi có thể thay đổi mật khẩu. Vui lòng kiểm tra hộp thư và nhấp vào liên kết xác thực.
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2 text-amber-700 border-amber-200" 
            onClick={() => toast.info("Đã gửi lại email xác thực. Vui lòng kiểm tra hộp thư của bạn.")}
          >
            Gửi lại email xác thực
          </Button>
        </div>
      )}
      
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
                        disabled={passwordChecked && isCurrentPasswordValid || checkingPassword}
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
                      disabled={checkingPassword || (passwordChecked && isCurrentPasswordValid)}
                    >
                      {checkingPassword ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          Đang kiểm tra...
                        </>
                      ) : passwordChecked && isCurrentPasswordValid ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-1 text-green-500" />
                          Đã xác nhận
                        </>
                      ) : "Kiểm tra mật khẩu"}
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
                      disabled={!passwordChecked || !isCurrentPasswordValid || loading || isEmailUnverified}
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
                      disabled={!passwordChecked || !isCurrentPasswordValid || loading || isEmailUnverified}
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
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <Button 
              type="submit" 
              disabled={loading || !passwordChecked || !isCurrentPasswordValid || isEmailUnverified}
              className="w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Đang cập nhật...
                </>
              ) : "Thay đổi mật khẩu"}
            </Button>
            
            {syncStatus !== 'none' && (
              <div className="flex items-center text-sm">
                {syncStatus === 'syncing' && (
                  <span className="flex items-center text-blue-600">
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Đang cập nhật mật khẩu...
                  </span>
                )}
                {syncStatus === 'synced' && (
                  <span className="flex items-center text-green-600">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Đã cập nhật mật khẩu
                  </span>
                )}
                {syncStatus === 'error' && (
                  <span className="flex items-center text-red-600">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Lỗi cập nhật mật khẩu
                  </span>
                )}
              </div>
            )}
          </div>
        </form>
      </Form>
    </>
  );
};

export default SecurityForm;
