import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Pencil, User, Lock, FileText, BookOpen, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Progress } from "@/components/ui/progress";

// Schema cho cập nhật hồ sơ
const profileFormSchema = z.object({
  firstName: z.string().min(2, { message: "Tên phải có ít nhất 2 ký tự" }),
  lastName: z.string().min(2, { message: "Họ phải có ít nhất 2 ký tự" }),
  email: z.string().email({ message: "Email không hợp lệ" }),
  bio: z.string().optional(),
});

// Schema cho đổi mật khẩu (chỉ cần 6 ký tự)
const passwordFormSchema = z.object({
  currentPassword: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
  newPassword: z.string().min(6, { message: "Mật khẩu mới phải có ít nhất 6 ký tự" }),
  confirmPassword: z.string().min(6, { message: "Xác nhận mật khẩu phải có ít nhất 6 ký tự" }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

// API URL
const API_URL = 'http://localhost:3000/api';

const UserProfile = () => {
  const { currentUser, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordChecked, setPasswordChecked] = useState(false);
  const [isCurrentPasswordValid, setIsCurrentPasswordValid] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form hồ sơ
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: currentUser?.firstName || "",
      lastName: currentUser?.lastName || "",
      email: currentUser?.email || "",
      bio: "",
    },
  });

  // Form mật khẩu
  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Dữ liệu giả lập khóa học đã đăng ký
  const enrolledCourses = [
    {
      id: "html-basics",
      title: "HTML Cơ Bản",
      progress: 25,
      image: "/placeholder.svg",
      color: "linear-gradient(90deg, #48BB78 0%, #38A169 100%)",
    },
    {
      id: "css-basics",
      title: "CSS Cơ Bản",
      progress: 10,
      image: "/placeholder.svg",
      color: "linear-gradient(90deg, #4299E1 0%, #3182CE 100%)",
    }
  ];

  // Dữ liệu giả lập chứng chỉ
  const certificates = [
    {
      id: "cert-js-1",
      title: "JavaScript Cơ Bản",
      issueDate: "12/05/2023",
      credential: "EPU-JS-2023-12345",
    }
  ];

  // Xử lý cập nhật hồ sơ
  const onUpdateProfile = (values: z.infer<typeof profileFormSchema>) => {
    setLoading(true);
    
    fetch(`${API_URL}/users/${currentUser?.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Không thể cập nhật thông tin');
        }
        return response.json();
      })
      .then(data => {
        toast.success("Thông tin hồ sơ đã được cập nhật");
        console.log("Profile updated:", data);
      })
      .catch(error => {
        toast.error(error.message || "Lỗi cập nhật thông tin");
        console.error("Error updating profile:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Kiểm tra mật khẩu hiện tại
  const checkCurrentPassword = async () => {
    const currentPassword = passwordForm.getValues("currentPassword");
    
    if (!currentPassword) {
      toast.error("Vui lòng nhập mật khẩu hiện tại");
      return;
    }
    
    setLoading(true);
    
    try {
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
      
      if (!response.ok) {
        throw new Error('Mật khẩu không chính xác');
      }
      
      await response.json();
      setIsCurrentPasswordValid(true);
      setPasswordChecked(true);
      toast.success("Mật khẩu chính xác");
    } catch (error: any) {
      setIsCurrentPasswordValid(false);
      setPasswordChecked(true);
      toast.error(error.message || "Mật khẩu không chính xác");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý đổi mật khẩu sử dụng async/await và tự cập nhật lên database
  const onChangePassword = async (values: z.infer<typeof passwordFormSchema>) => {
    if (!passwordChecked || !isCurrentPasswordValid) {
      toast.error("Vui lòng kiểm tra mật khẩu hiện tại trước");
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser?.id,
          currentPassword: values.currentPassword,
          newPassword: values.newPassword
        }),
      });
      
      if (!response.ok) {
        throw new Error('Không thể thay đổi mật khẩu');
      }
      
      await response.json();
      toast.success("Mật khẩu đã được cập nhật thành công");
      passwordForm.reset();
      setPasswordChecked(false);
      setIsCurrentPasswordValid(false);
    } catch (error: any) {
      toast.error(error.message || "Lỗi thay đổi mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Bạn chưa đăng nhập</h2>
                <p className="text-muted-foreground mb-6">Vui lòng đăng nhập để xem hồ sơ của bạn</p>
                <Button asChild>
                  <Link to="/login">Đăng nhập</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-64 space-y-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <User className="h-12 w-12 text-gray-500 dark:text-gray-400" />
                  </div>
                  <h2 className="text-xl font-semibold">{currentUser.firstName} {currentUser.lastName}</h2>
                  <p className="text-muted-foreground text-sm">{currentUser.email}</p>
                  <div className="mt-4">
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/my-courses">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Khóa học của tôi
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-3">Tiến độ học tập</h3>
                  {enrolledCourses.map((course) => (
                    <div key={course.id} className="mb-3 last:mb-0">
                      <div className="flex justify-between text-sm mb-1">
                        <Link to={`/course/${course.id}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                          {course.title}
                        </Link>
                        <span>{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
            
            <div className="flex-grow">
              <Tabs defaultValue="profile">
                <TabsList className="mb-6 w-full justify-start">
                  <TabsTrigger value="profile" className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Thông tin cá nhân
                  </TabsTrigger>
                  <TabsTrigger value="security" className="flex items-center">
                    <Lock className="h-4 w-4 mr-2" />
                    Bảo mật
                  </TabsTrigger>
                  <TabsTrigger value="certificates" className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Chứng chỉ
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile">
                  <Card>
                    <CardContent className="pt-6">
                      <h2 className="text-xl font-semibold mb-6 flex items-center">
                        <Pencil className="h-5 w-5 mr-2 text-blue-500" />
                        Cập nhật thông tin cá nhân
                      </h2>
                      
                      <Form {...profileForm}>
                        <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={profileForm.control}
                              name="firstName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Tên</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Nhập tên của bạn" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={profileForm.control}
                              name="lastName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Họ</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Nhập họ của bạn" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={profileForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input placeholder="example@example.com" {...field} readOnly />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="bio"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Giới thiệu</FormLabel>
                                <FormControl>
                                  <textarea
                                    className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Giới thiệu ngắn gọn về bản thân..."
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button type="submit" disabled={loading}>
                            {loading ? "Đang cập nhật..." : "Cập nhật thông tin"}
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="security">
                  <Card>
                    <CardContent className="pt-6">
                      <h2 className="text-xl font-semibold mb-6 flex items-center">
                        <Lock className="h-5 w-5 mr-2 text-blue-500" />
                        Thay đổi mật khẩu
                      </h2>
                      
                      <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-6">
                          <div className="space-y-1">
                            <FormField
                              control={passwordForm.control}
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
                                      {showCurrentPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
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
                            control={passwordForm.control}
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
                                    {showNewPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                                  </button>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={passwordForm.control}
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
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
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
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="certificates">
                  <Card>
                    <CardContent className="pt-6">
                      <h2 className="text-xl font-semibold mb-6 flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-blue-500" />
                        Chứng chỉ của tôi
                      </h2>
                      
                      {certificates.length > 0 ? (
                        <div className="space-y-4">
                          {certificates.map((cert) => (
                            <div key={cert.id} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                              <div>
                                <h3 className="font-medium">{cert.title}</h3>
                                <p className="text-sm text-muted-foreground">Cấp ngày: {cert.issueDate}</p>
                                <p className="text-sm text-muted-foreground">Mã chứng chỉ: {cert.credential}</p>
                              </div>
                              <Button variant="outline" size="sm">Xem chứng chỉ</Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <FileText className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2">Chưa có chứng chỉ nào</h3>
                          <p className="text-muted-foreground mb-6">
                            Hoàn thành các khóa học để nhận chứng chỉ của bạn.
                          </p>
                          <Button asChild>
                            <Link to="/courses">Khám phá khóa học</Link>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default UserProfile;
