
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Link, useNavigate, Navigate } from "react-router-dom";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Code, Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const Signup = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }
    
    if (!acceptTerms) {
      toast.error("Vui lòng đồng ý với điều khoản dịch vụ");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await signup(email, password, firstName, lastName);
      if (success) {
        toast.success("Đăng ký thành công! Vui lòng đăng nhập");
        navigate('/login');
      }
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
            <CardTitle className="text-2xl font-bold">Tạo Tài Khoản</CardTitle>
            <CardDescription className="dark:text-gray-300">Đăng ký để bắt đầu hành trình học tập của bạn</CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Họ</Label>
                  <Input 
                    id="firstName" 
                    placeholder="Nhập họ của bạn"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">Tên</Label>
                  <Input 
                    id="lastName" 
                    placeholder="Nhập tên của bạn"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Mật Khẩu</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Tạo mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác Nhận Mật Khẩu</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  placeholder="Xác nhận mật khẩu của bạn"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="terms" 
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                />
                <Label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-300">
                  Tôi đồng ý với{" "}
                  <Link to="/terms" className="text-green-600 dark:text-green-400 hover:underline">
                    Điều Khoản Dịch Vụ
                  </Link>{" "}
                  và{" "}
                  <Link to="/privacy" className="text-green-600 dark:text-green-400 hover:underline">
                    Chính Sách Bảo Mật
                  </Link>
                </Label>
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
                  'Đăng Ký'
                )}
              </Button>
              <div className="text-sm text-center text-gray-600 dark:text-gray-300">
                Đã có tài khoản?{" "}
                <Link to="/login" className="text-green-600 dark:text-green-400 hover:underline font-medium">
                  Đăng nhập
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

export default Signup;
