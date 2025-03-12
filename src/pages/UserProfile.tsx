
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FileText, Lock, User, AlertTriangle, Mail } from 'lucide-react';
import UserSidebar from '@/components/UserSidebar';
import ProfileForm from '@/components/ProfileForm';
import SecurityForm from '@/components/SecurityForm';
import CertificatesTab from '@/components/CertificatesTab';
import { toast } from 'sonner';
import { fetchUserEnrolledCourses, fetchUserCertificates } from '@/services/apiUtils';

const UserProfile = () => {
  const { currentUser } = useAuth();

  // Use React Query to fetch user courses
  const { data: userCourses, isLoading: isLoadingCourses } = useQuery({
    queryKey: ['userCourses', currentUser?.id],
    queryFn: () => fetchUserEnrolledCourses(currentUser?.id || ''),
    enabled: !!currentUser?.id,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Use React Query to fetch user certificates
  const { data: userCertificates, isLoading: isLoadingCertificates } = useQuery({
    queryKey: ['userCertificates', currentUser?.id],
    queryFn: () => fetchUserCertificates(currentUser?.id || ''),
    enabled: !!currentUser?.id,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Check if user email is unverified
  const isEmailUnverified = currentUser?.email_confirmed_at === undefined || currentUser?.email_confirmed_at === null;

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
      
      {isEmailUnverified && (
        <div className="bg-amber-50 border-amber-200 border-b py-2 px-4">
          <div className="container mx-auto flex items-center text-amber-800 text-sm">
            <Mail className="h-4 w-4 mr-2" />
            <span>
              Email của bạn chưa được xác thực. Vui lòng kiểm tra hộp thư và xác nhận email để có thể sử dụng đầy đủ tính năng.
            </span>
            <Button 
              variant="link" 
              size="sm" 
              className="text-blue-600 ml-2" 
              onClick={() => toast.info("Đã gửi lại email xác thực. Vui lòng kiểm tra hộp thư của bạn.")}
            >
              Gửi lại email xác thực
            </Button>
          </div>
        </div>
      )}
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar Component */}
            <UserSidebar 
              enrolledCourses={userCourses || []} 
              isLoadingCourses={isLoadingCourses}
            />
            
            {/* Nội dung chính */}
            <div className="flex-grow">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Hồ sơ của bạn</h1>
              </div>
              
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
                      <ProfileForm />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="security">
                  <Card>
                    <CardContent className="pt-6">
                      <SecurityForm />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="certificates">
                  <CertificatesTab 
                    certificates={userCertificates || []} 
                    isLoading={isLoadingCertificates}
                  />
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
