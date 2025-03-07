
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Code } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

// Component trang đăng ký
const Signup = () => {
  return (
    <div className="min-h-screen flex flex-col  dark:bg-gray-900 dark:text-white">
      <Navbar />
      {/* Tăng khoảng cách so với Header bằng mt-20, vẫn giữ py-12 để có padding dọc */}
      <div className="flex-grow flex items-center justify-center py-12 mt-20">
        {/* Card thêm dark:bg-gray-800, dark:text-white để màu nền và chữ chuyển tối */}
        <Card className="w-full max-w-md mx-auto shadow-pulse dark:bg-gray-800 dark:text-white">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center
                bg-white text-black       /* Nền trắng, icon đen (Light Mode) */
                dark:bg-gray-800 dark:text-white /* Nền đen, icon trắng (Dark Mode) */">
            <Code className="h-6 w-6" />
</div>
            </div>
            <CardTitle className="text-2xl font-bold">Tạo Tài Khoản</CardTitle>
            <CardDescription>Đăng ký để bắt đầu hành trình học tập của bạn</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Họ</Label>
                <Input id="firstName" placeholder="Nhập họ của bạn" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Tên</Label>
                <Input id="lastName" placeholder="Nhập tên của bạn" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Nhập email của bạn" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Mật Khẩu</Label>
              <Input id="password" type="password" placeholder="Tạo mật khẩu" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác Nhận Mật Khẩu</Label>
              <Input id="confirmPassword" type="password" placeholder="Xác nhận mật khẩu của bạn" />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" />
              <Label htmlFor="terms" className="text-sm text-gray-600">
                Tôi đồng ý với{" "}
                <Link to="/terms" className="text-epu-blue hover:underline">
                  Điều Khoản Dịch Vụ
                </Link>{" "}
                và{" "}
                <Link to="/privacy" className="text-epu-blue hover:underline">
                  Chính Sách Bảo Mật
                </Link>
              </Label>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button className="w-full bg-epu-green hover:bg-epu-green/90 ripple-effect">Đăng Ký</Button>
            
            <div className="text-sm text-center text-gray-600">
              Đã có tài khoản?{" "}
              <Link to="/login" className="text-epu-blue hover:underline font-medium">
                Đăng nhập
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default Signup;
