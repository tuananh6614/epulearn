
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Link, useNavigate, Navigate } from "react-router-dom";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Code, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Check for authentication errors on load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const errorMsg = urlParams.get('error');
    if (errorMsg) {
      setAuthError(decodeURIComponent(errorMsg));
      // Remove the error from the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Debugging
  useEffect(() => {
    console.log("Login component mounted, isAuthenticated:", isAuthenticated);
    
    try {
      // Check if the token is available in localStorage
      const session = localStorage.getItem('epu_user');
      console.log("User in localStorage:", session ? "Available" : "Not available");
    } catch (error) {
      console.error("Error checking localStorage:", error);
    }
    
    return () => {
      console.log("Login component unmounted");
    };
  }, [isAuthenticated]);

  // Redirect if already logged in
  if (isAuthenticated) {
    console.log("User is authenticated, redirecting to home");
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Vui lòng nhập email và mật khẩu");
      return;
    }
    
    setIsSubmitting(true);
    setAuthError(null);
    
    try {
      console.log("Attempting login with:", email);
      const success = await login(email, password);
      console.log("Login result:", success);
      
      if (success) {
        console.log("Login successful, navigating to home");
        navigate('/');
        toast.success("Đăng nhập thành công!");
      } else {
        console.log("Login failed but no error was thrown");
        setAuthError("Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu của bạn.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setAuthError("Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col dark:bg-gray-900 dark:text-white">
      <Navbar />

      <div className="flex-grow flex items-center justify-center py-12 mt-20">
        <Card className="w-full max-w-md mx-auto shadow-pulse dark:bg-gray-800 dark:text-white">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center
                  bg-white text-black 
                  dark:bg-gray-800 dark:text-white">
                <Code className="h-6 w-6" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Chào Mừng Trở Lại</CardTitle>
            <CardDescription className="dark:text-gray-300">
              Nhập thông tin đăng nhập để truy cập tài khoản của bạn
            </CardDescription>
          </CardHeader>

          {authError && (
            <div className="px-6">
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4 mr-2" />
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Nhập email của bạn"
                  className="dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mật Khẩu</Label>
                  <Link to="/forgot-password" className="text-sm text-green-600 dark:text-green-400 hover:underline">
                    Quên mật khẩu?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Nhập mật khẩu của bạn"
                  className="dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white dark:bg-green-600 dark:hover:bg-green-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý
                  </>
                ) : (
                  'Đăng Nhập'
                )}
              </Button>
              <div className="text-sm text-center text-gray-600 dark:text-gray-300">
                Chưa có tài khoản?{" "}
                <Link to="/signup" className="text-green-600 dark:text-green-400 hover:underline font-medium">
                  Đăng ký
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default Login;
