import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FileText, Lock, User, Mail, AlertCircle, Loader2 } from 'lucide-react';
import UserSidebar from '@/components/UserSidebar';
import ProfileForm from '@/components/ProfileForm';
import SecurityForm from '@/components/SecurityForm';
import CertificatesTab from '@/components/CertificatesTab';
import { fetchUserEnrolledCourses, fetchUserCertificates } from '@/services/apiUtils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const UserProfile = () => {
  const { currentUser, resendVerificationEmail } = useAuth();
  const [isResendingEmail, setIsResendingEmail] = React.useState(false);

  const { data: userCourses, isLoading: isLoadingCourses } = useQuery({
    queryKey: ['userCourses', currentUser?.id],
    queryFn: () => fetchUserEnrolledCourses(currentUser?.id || ''),
    enabled: !!currentUser?.id,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const { data: userCertificates, isLoading: isLoadingCertificates } = useQuery({
    queryKey: ['userCertificates', currentUser?.id],
    queryFn: () => fetchUserCertificates(currentUser?.id || ''),
    enabled: !!currentUser?.id,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const isEmailUnverified = currentUser?.email_confirmed_at === undefined || currentUser?.email_confirmed_at === null;

  const handleResendEmail = async () => {
    if (isResendingEmail) return;
    
    setIsResendingEmail(true);
    try {
      await resendVerificationEmail();
    } finally {
      setIsResendingEmail(false);
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
      
      {isEmailUnverified && (
        <div className="bg-amber-50 border-amber-300 border-b py-2 px-4">
          <div className="container mx-auto">
            <Alert variant="default" className="border-0 bg-transparent p-0">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <AlertTitle className="text-amber-800">Email chưa xác thực</AlertTitle>
              <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex items-center gap-1 text-amber-700">
                  <span>Email của bạn</span> 
                  <span className="font-medium mx-1">{currentUser.email}</span>
                  <span>chưa được xác thực</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-fit text-amber-700 border-amber-300 hover:bg-amber-100"
                  onClick={handleResendEmail}
                  disabled={isResendingEmail}
                >
                  {isResendingEmail ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Đang gửi...
                    </>
                  ) : "Gửi lại email xác thực"}
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )}
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8">
            <UserSidebar 
              enrolledCourses={userCourses || []} 
              isLoadingCourses={isLoadingCourses}
            />
            
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
