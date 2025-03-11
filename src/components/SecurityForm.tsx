
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Lock, Eye, EyeOff, Database, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { API_URL, fetchWithTimeout } from '@/services/apiUtils';

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
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Check server connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      setConnectionStatus('checking');
      try {
        const response = await fetchWithTimeout(`${API_URL}/health-check`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-cache'
        }, 3000);
        
        if (response.ok) {
          setConnectionStatus('connected');
          setErrorDetails(null);
        } else {
          setConnectionStatus('disconnected');
          const statusText = `Máy chủ trả về lỗi: ${response.status} ${response.statusText}`;
          setErrorDetails(statusText);
        }
      } catch (error) {
        setConnectionStatus('disconnected');
        setErrorDetails(`Lỗi kết nối: ${(error as Error).message}`);
      }
    };
    
    checkConnection();
  }, []);
  
  // Validate current password - using plain text
  const checkCurrentPassword = async () => {
    const currentPassword = form.getValues("currentPassword");
    
    if (!currentPassword) {
      toast.error("Vui lòng nhập mật khẩu hiện tại");
      return;
    }
    
    setCheckingPassword(true);
    
    try {
      // Kiểm tra kết nối trước
      try {
        const response = await fetchWithTimeout(`${API_URL}/health-check`, {}, 3000);
        if (!response.ok) {
          throw new Error(`Máy chủ không phản hồi: ${response.status}`);
        }
      } catch (error) {
        throw new Error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng hoặc máy chủ đã chạy chưa.");
      }
      
      // Tiếp tục kiểm tra mật khẩu
      const response = await fetchWithTimeout(`${API_URL}/check-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser?.id,
          password: currentPassword // Plain text password
        }),
      }, 5000);
      
      const data = await response.json().catch(() => ({ message: 'Lỗi phản hồi từ máy chủ' }));
      
      if (response.ok) {
        setIsCurrentPasswordValid(true);
        setPasswordChecked(true);
        toast.success("Mật khẩu chính xác");
      } else {
        throw new Error(data.message || 'Mật khẩu không chính xác');
      }
    } catch (error) {
      console.error('Error checking password:', error);
      setIsCurrentPasswordValid(false);
      setPasswordChecked(true);
      toast.error((error as Error).message || "Mật khẩu không chính xác");
      
      // Kiểm tra và hiển thị trạng thái kết nối
      setConnectionStatus('disconnected');
      setErrorDetails((error as Error).message);
    } finally {
      setCheckingPassword(false);
    }
  };
  
  // Handle password change - Plain text
  const onSubmit = async (values: PasswordFormValues) => {
    if (!passwordChecked || !isCurrentPasswordValid) {
      toast.error("Vui lòng kiểm tra mật khẩu hiện tại trước");
      return;
    }
    
    setLoading(true);
    setSyncStatus('syncing');
    
    try {
      // Kiểm tra kết nối trước
      try {
        const response = await fetchWithTimeout(`${API_URL}/health-check`, {}, 3000);
        if (!response.ok) {
          setSyncStatus('error');
          throw new Error(`Máy chủ không phản hồi: ${response.status}`);
        }
      } catch (error) {
        setSyncStatus('error');
        throw new Error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng hoặc máy chủ đã chạy chưa.");
      }
      
      // Tiếp tục đổi mật khẩu
      const success = await changePassword(values.currentPassword, values.newPassword);
      
      if (success) {
        setSyncStatus('synced');
        toast.success("Mật khẩu đã được cập nhật thành công và đồng bộ với CSDL. Vui lòng đăng nhập lại.");
        
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
      
      {/* Hiển thị trạng thái kết nối */}
      <div className="mb-6 p-3 rounded border">
        <div className="flex items-center text-sm">
          <Database className="h-4 w-4 mr-1" />
          <span className="mr-2">Trạng thái kết nối:</span>
          {connectionStatus === 'checking' ? (
            <div className="flex items-center text-blue-500">
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              <span>Đang kiểm tra kết nối...</span>
            </div>
          ) : connectionStatus === 'connected' ? (
            <span className="flex items-center text-green-600">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Đã kết nối với máy chủ
            </span>
          ) : (
            <span className="flex items-center text-amber-600">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Không có kết nối
            </span>
          )}
        </div>
        
        {errorDetails && connectionStatus === 'disconnected' && (
          <div className="mt-2 text-sm text-amber-600 bg-amber-50 p-2 rounded">
            <p>{errorDetails}</p>
            <p className="mt-1">Vui lòng kiểm tra:</p>
            <ul className="list-disc pl-5">
              <li>Máy chủ MySQL đã chạy chưa</li>
              <li>Tên người dùng và mật khẩu trong file .env là chính xác</li>
              <li>Máy chủ Express Node.js đang chạy (trong thư mục server)</li>
            </ul>
          </div>
        )}
      </div>
      
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
                      disabled={checkingPassword || (passwordChecked && isCurrentPasswordValid) || connectionStatus === 'disconnected'}
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
                      disabled={!passwordChecked || !isCurrentPasswordValid || loading}
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
                      disabled={!passwordChecked || !isCurrentPasswordValid || loading}
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
              disabled={loading || !passwordChecked || !isCurrentPasswordValid || connectionStatus === 'disconnected'}
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
                    Đang đồng bộ với CSDL...
                  </span>
                )}
                {syncStatus === 'synced' && (
                  <span className="flex items-center text-green-600">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Đã đồng bộ với CSDL
                  </span>
                )}
                {syncStatus === 'error' && (
                  <span className="flex items-center text-red-600">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Lỗi đồng bộ với CSDL
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
