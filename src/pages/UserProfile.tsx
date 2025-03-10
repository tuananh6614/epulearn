
import React, { useState, useEffect } from 'react';
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
import { Pencil, User, Lock, FileText, BookOpen, Eye, EyeOff, Camera, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Schema cho cập nhật hồ sơ
const profileFormSchema = z.object({
  firstName: z.string().min(2, { message: "Tên phải có ít nhất 2 ký tự" }),
  lastName: z.string().min(2, { message: "Họ phải có ít nhất 2 ký tự" }),
  email: z.string().email({ message: "Email không hợp lệ" }),
  bio: z.string().optional(),
});

// Schema cho đổi mật khẩu
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

// API URL
const API_URL = 'http://localhost:3000/api';

// Interface cho khóa học
interface EnrolledCourse {
  id: string;
  title: string;
  progress: number;
  image: string;
  color: string;
}

// Interface cho chứng chỉ
interface Certificate {
  id: string;
  title: string;
  issueDate: string;
  credential: string;
}

const UserProfile = () => {
  const { currentUser, updateCurrentUser, logout, changePassword, verifyCurrentPassword, uploadAvatar } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [currentPasswordValid, setCurrentPasswordValid] = useState<boolean | null>(null);
  const [passwordVerifying, setPasswordVerifying] = useState(false);

  // Form hồ sơ
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: currentUser?.firstName || "",
      lastName: currentUser?.lastName || "",
      email: currentUser?.email || "",
      bio: currentUser?.bio || "",
    },
  });

  // Form mật khẩu - with auto-verification
  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Fetch enrolled courses for the current user
  const fetchUserCourses = async () => {
    if (!currentUser?.id) return [];
    
    try {
      const response = await fetch(`${API_URL}/user-courses/${currentUser.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch enrolled courses');
      }
      const data = await response.json();
      return data.courses || [];
    } catch (error) {
      console.error('Error fetching user courses:', error);
      // Return empty array
      return [];
    }
  };

  // Fetch certificates for the current user
  const fetchUserCertificates = async () => {
    if (!currentUser?.id) return [];
    
    try {
      const response = await fetch(`${API_URL}/user-certificates/${currentUser.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch certificates');
      }
      const data = await response.json();
      return data.certificates || [];
    } catch (error) {
      console.error('Error fetching user certificates:', error);
      return [];
    }
  };

  // Use React Query to fetch user courses
  const { data: userCourses, isLoading: isLoadingCourses } = useQuery({
    queryKey: ['userCourses', currentUser?.id],
    queryFn: fetchUserCourses,
    enabled: !!currentUser?.id,
  });

  // Use React Query to fetch user certificates
  const { data: userCertificates, isLoading: isLoadingCertificates } = useQuery({
    queryKey: ['userCertificates', currentUser?.id],
    queryFn: fetchUserCertificates,
    enabled: !!currentUser?.id,
  });

  // Update enrolled courses and certificates when data is loaded
  useEffect(() => {
    if (userCourses) {
      setEnrolledCourses(userCourses);
    }
  }, [userCourses]);

  useEffect(() => {
    if (userCertificates) {
      setCertificates(userCertificates);
    }
  }, [userCertificates]);

  // Load avatar URL from user data
  useEffect(() => {
    if (currentUser?.avatarUrl) {
      setAvatarUrl(currentUser.avatarUrl);
    }
  }, [currentUser]);

  // Update form values when currentUser changes
  useEffect(() => {
    if (currentUser) {
      profileForm.reset({
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        email: currentUser.email || "",
        bio: currentUser.bio || "",
      });
    }
  }, [currentUser, profileForm]);

  // Xử lý upload ảnh
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setUploadingAvatar(true);
    
    try {
      // Upload avatar using the new method in AuthContext
      const result = await uploadAvatar(file);
      
      if (result.success) {
        setAvatarUrl(result.avatarUrl || null);
        toast.success("Ảnh đại diện đã được cập nhật");
      } else {
        toast.error(result.message || "Không thể cập nhật ảnh đại diện");
      }
    } catch (error) {
      console.error('Error handling avatar:', error);
      toast.error("Không thể xử lý ảnh đại diện");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Xử lý cập nhật hồ sơ
  const onUpdateProfile = async (values: z.infer<typeof profileFormSchema>) => {
    if (!currentUser) return;
    
    setLoading(true);
    
    try {
      // Call the updateCurrentUser method from AuthContext
      const success = await updateCurrentUser({
        firstName: values.firstName,
        lastName: values.lastName,
        bio: values.bio
      });
      
      if (success) {
        toast.success("Thông tin hồ sơ đã được cập nhật");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Lỗi cập nhật thông tin");
    } finally {
      setLoading(false);
    }
  };

  // Auto-verify password as user types
  const handleCurrentPasswordChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    passwordForm.setValue("currentPassword", password);
    
    // Only proceed with verification if password is at least 6 chars long
    if (password.length >= 6) {
      setPasswordVerifying(true);
      setCurrentPasswordValid(null);
      
      try {
        // Use the new verifyCurrentPassword method
        const result = await verifyCurrentPassword(password);
        
        if (result.success) {
          setCurrentPasswordValid(true);
          toast.success("Mật khẩu hợp lệ, bạn có thể tiếp tục", {
            id: "password-verify",
            duration: 2000,
          });
          
          // Enable the rest of the form
          const inputElements = document.querySelectorAll('input[name="newPassword"], input[name="confirmPassword"]');
          inputElements.forEach((element) => {
            (element as HTMLInputElement).disabled = false;
          });
        } else {
          setCurrentPasswordValid(false);
          toast.error("Mật khẩu không đúng", {
            id: "password-verify",
            duration: 2000,
          });
        }
      } catch (error) {
        console.error("Error verifying password:", error);
        setCurrentPasswordValid(false);
      } finally {
        setPasswordVerifying(false);
      }
    } else {
      setCurrentPasswordValid(null);
    }
  };

  // Xử lý đổi mật khẩu
  const onChangePassword = (values: z.infer<typeof passwordFormSchema>) => {
    setLoading(true);
    
    changePassword(values.currentPassword, values.newPassword)
      .then(success => {
        if (success) {
          // No need to do anything here, the AuthContext will handle the logout
          passwordForm.reset();
        }
      })
      .catch(error => {
        toast.error("Lỗi thay đổi mật khẩu");
        console.error("Error changing password:", error);
        setLoading(false);
      });
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
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    <Avatar className="w-24 h-24 border-2 border-primary">
                      <AvatarImage src={avatarUrl || undefined} alt={`${currentUser.firstName || ''} ${currentUser.lastName || ''}`} />
                      <AvatarFallback className="text-2xl bg-primary/10">
                        {currentUser.firstName?.[0]}{currentUser.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0 right-0">
                      <label htmlFor="avatar-upload" className="cursor-pointer">
                        <div className="bg-primary text-white p-1.5 rounded-full hover:bg-primary/90 transition-colors">
                          {uploadingAvatar ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Camera className="h-4 w-4" />
                          )}
                        </div>
                        <input 
                          id="avatar-upload" 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleAvatarUpload}
                          disabled={uploadingAvatar}
                        />
                      </label>
                    </div>
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
                  {isLoadingCourses ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                    </div>
                  ) : enrolledCourses.length > 0 ? (
                    enrolledCourses.map((course) => (
                      <div key={course.id} className="mb-3 last:mb-0">
                        <div className="flex justify-between text-sm mb-1">
                          <Link to={`/course/${course.id}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                            {course.title}
                          </Link>
                          <span>{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-center text-muted-foreground py-2">
                      Bạn chưa đăng ký khóa học nào
                    </div>
                  )}
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
                                        className={`${currentPasswordValid === true ? 'border-green-500' : currentPasswordValid === false ? 'border-red-500' : ''}`}
                                        {...field} 
                                        onChange={(e) => {
                                          field.onChange(e);
                                          handleCurrentPasswordChange(e);
                                        }}
                                      />
                                    </FormControl>
                                    <div className="absolute right-10 top-1/2 -translate-y-1/2">
                                      {passwordVerifying ? (
                                        <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                                      ) : currentPasswordValid === true ? (
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                      ) : currentPasswordValid === false ? (
                                        <XCircle className="h-4 w-4 text-red-500" />
                                      ) : null}
                                    </div>
                                    <button 
                                      type="button" 
                                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                      className="absolute right-3 top-1/2 -translate-y-1/2"
                                    >
                                      {showCurrentPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                                    </button>
                                  </div>
                                  <FormMessage />
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
                                      disabled={!currentPasswordValid}
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
                                      disabled={!currentPasswordValid}
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
                            disabled={loading || !currentPasswordValid}
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
                      
                      {isLoadingCertificates ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                        </div>
                      ) : certificates.length > 0 ? (
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
