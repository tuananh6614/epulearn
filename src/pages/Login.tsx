import React from 'react';
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
import { Link } from "react-router-dom";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Code } from 'lucide-react';

const Login = () => {
  return (
    <div className="min-h-screen flex flex-col dark:bg-gray-900 dark:text-white">
      <Navbar />

      <div className="flex-grow flex items-center justify-center py-12 mt-20">
        <Card className="w-full max-w-md mx-auto shadow-pulse dark:bg-gray-800 dark:text-white">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center
                bg-white text-black       /* Nền trắng, icon đen (Light Mode) */
                dark:bg-gray-800 dark:text-white /* Nền đen, icon trắng (Dark Mode) */">
            <Code className="h-6 w-6" />
</div>
            </div>
            <CardTitle className="text-2xl font-bold">Chào Mừng Trở Lại</CardTitle>
            <CardDescription>
              Nhập thông tin đăng nhập để truy cập tài khoản của bạn
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Nhập email của bạn"
                className="dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mật Khẩu</Label>
                <Link to="" className="text-sm text-epu-blue hover:underline">
                  Quên mật khẩu?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Nhập mật khẩu của bạn"
                className="dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button className="w-full bg-epu-green hover:bg-epu-green/90 ripple-effect">
              Đăng Nhập
            </Button>
            <div className="text-sm text-center text-gray-600 dark:text-gray-300">
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
