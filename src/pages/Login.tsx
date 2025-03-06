
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Code } from 'lucide-react';

// Component trang đăng nhập
const Login = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center bg-gray-50 py-12">
        <Card className="w-full max-w-md mx-auto shadow-pulse">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-epu-green to-epu-blue flex items-center justify-center">
                <Code className="h-6 w-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Chào Mừng Trở Lại</CardTitle>
            <CardDescription>Nhập thông tin đăng nhập để truy cập tài khoản của bạn</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Nhập email của bạn" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mật Khẩu</Label>
                <Link to="/forgot-password" className="text-sm text-epu-blue hover:underline">
                  Quên mật khẩu?
                </Link>
              </div>
              <Input id="password" type="password" placeholder="Nhập mật khẩu của bạn" />
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button className="w-full bg-epu-green hover:bg-epu-green/90 ripple-effect">Đăng Nhập</Button>
            
            <div className="text-sm text-center text-gray-600">
              Chưa có tài khoản?{" "}
              <Link to="/signup" className="text-epu-blue hover:underline font-medium">
                Đăng ký
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default Login;
