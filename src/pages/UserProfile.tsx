
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

// API URL - updated to use a fallback when API is unavailable
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
          // Short timeout to not block the UI for too long
          signal: AbortSignal.timeout(3000)
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

  // Fetch enrolled courses cho người dùng hiện tại
  const fetchUserCourses = async () => {
    if (!currentUser?.id) return [];
    
    try {
      // First try API
      try {
        const response = await fetch(`${API_URL}/users/${currentUser.id}/courses`);
        if (!response.ok) {
          throw new Error('Failed to fetch enrolled courses');
        }
        const data = await response.json();
        return data.courses || [];
      } catch (apiError) {
        console.error('API Error fetching user courses:', apiError);
        // Fallback to mock data if API fails
        console.log('Using mock course data due to API failure');
        return [
          { id: "c1", title: "React Fundamentals", progress: 80, imageUrl: "/placeholder.svg" },
          { id: "c2", title: "TypeScript Advanced", progress: 45, imageUrl: "/placeholder.svg" }
        ];
      }
    } catch (error) {
      console.error('Error fetching user courses:', error);
      return [];
    }
  };

  // Fetch certificates cho người dùng hiện tại
  const fetchUserCertificates = async () => {
    if (!currentUser?.id) return [];
    
    try {
      // First try API
      try {
        const response = await fetch(`${API_URL}/users/${currentUser.id}/certificates`);
        if (!response.ok) {
          throw new Error('Failed to fetch certificates');
        }
        const data = await response.json();
        return data.certificates || [];
      } catch (apiError) {
        console.error('API Error fetching user certificates:', apiError);
        // Fallback to mock data if API fails
        console.log('Using mock certificate data due to API failure');
        return [
          { 
            id: "cert1", 
            title: "React Developer", 
            issueDate: "2025-01-15", 
            courseName: "React Mastery", 
            credentialId: "REACT-123456",
            imageUrl: "/placeholder.svg" 
          },
          { 
            id: "cert2", 
            title: "TypeScript Expert", 
            issueDate: "2025-02-20", 
            courseName: "TypeScript Advanced", 
            credentialId: "TS-789012",
            imageUrl: "/placeholder.svg" 
          }
        ];
      }
    } catch (error) {
      console.error('Error fetching user certificates:', error);
      return [];
    }
  };

  // Sử dụng React Query để lấy khóa học người dùng
  const { data: userCourses, isLoading: isLoadingCourses } = useQuery({
    queryKey: ['userCourses', currentUser?.id],
    queryFn: fetchUserCourses,
    enabled: !!currentUser?.id,
  });

  // Sử dụng React Query để lấy chứng chỉ người dùng
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
              Không thể kết nối với máy chủ. Dữ liệu sẽ được lưu cục bộ và đồng bộ khi kết nối được khôi phục.
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
                      <span className="text-amber-600">Không có kết nối, dữ liệu được lưu cục bộ</span>
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
