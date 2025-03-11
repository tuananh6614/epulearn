
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FileText, Lock, User, AlertTriangle, Database } from 'lucide-react';
import UserSidebar from '@/components/UserSidebar';
import ProfileForm from '@/components/ProfileForm';
import SecurityForm from '@/components/SecurityForm';
import CertificatesTab from '@/components/CertificatesTab';
import { toast } from 'sonner';

// API URL
const API_URL = 'http://localhost:3000/api';

const UserProfile = () => {
  const { currentUser } = useAuth();
  const [apiConnectionStatus, setApiConnectionStatus] = React.useState<'connected' | 'disconnected' | 'checking'>('checking');

  // Check API connection on mount
  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        const response = await fetch(`${API_URL}/health-check`, { 
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(5000)
        });
        
        if (response.ok) {
          setApiConnectionStatus('connected');
        } else {
          setApiConnectionStatus('disconnected');
          console.warn('API health check failed:', await response.text());
        }
      } catch (error) {
        console.error('API connection error:', error);
        setApiConnectionStatus('disconnected');
      }
    };
    
    checkApiConnection();
  }, []);

  // Fetch enrolled courses from the database
  const fetchUserCourses = async () => {
    if (!currentUser?.id) return [];
    
    try {
      const response = await fetch(`${API_URL}/users/${currentUser.id}/courses`, {
        signal: AbortSignal.timeout(15000)
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch enrolled courses');
      }
      
      const data = await response.json();
      return data.courses || [];
    } catch (error) {
      console.error('Error fetching user courses:', error);
      toast.error("Không thể tải dữ liệu khóa học. Vui lòng kiểm tra kết nối đến máy chủ và thử lại sau.");
      return []; // Return empty array on error
    }
  };

  // Fetch certificates from the database
  const fetchUserCertificates = async () => {
    if (!currentUser?.id) return [];
    
    try {
      const response = await fetch(`${API_URL}/users/${currentUser.id}/certificates`, {
        signal: AbortSignal.timeout(15000)
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch certificates');
      }
      
      const data = await response.json();
      return data.certificates || [];
    } catch (error) {
      console.error('Error fetching user certificates:', error);
      toast.error("Không thể tải dữ liệu chứng chỉ. Vui lòng kiểm tra kết nối đến máy chủ và thử lại sau.");
      return []; // Return empty array on error
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
      
      {apiConnectionStatus === 'disconnected' && (
        <div className="bg-amber-50 border-amber-200 border-b py-2 px-4">
          <div className="container mx-auto flex items-center text-amber-800 text-sm">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <span>
              Không thể kết nối với máy chủ. Vui lòng kiểm tra kết nối mạng và làm mới trang.
            </span>
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
                
                <div className="flex items-center text-sm">
                  <Database className="h-4 w-4 mr-1" />
                  <span>
                    Trạng thái: {' '}
                    {apiConnectionStatus === 'connected' ? (
                      <span className="text-green-600">Đã kết nối với máy chủ</span>
                    ) : apiConnectionStatus === 'checking' ? (
                      <span className="text-blue-600">Đang kiểm tra kết nối...</span>
                    ) : (
                      <span className="text-amber-600">Không có kết nối, vui lòng kiểm tra mạng</span>
                    )}
                  </span>
                </div>
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
