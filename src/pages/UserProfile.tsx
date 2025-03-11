
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FileText, Lock, User, AlertTriangle, Database, Loader2, CheckCircle2 } from 'lucide-react';
import UserSidebar from '@/components/UserSidebar';
import ProfileForm from '@/components/ProfileForm';
import SecurityForm from '@/components/SecurityForm';
import CertificatesTab from '@/components/CertificatesTab';
import { toast } from 'sonner';
import { API_URL, fetchWithTimeout, handleApiResponse } from '@/services/apiUtils';

const UserProfile = () => {
  const { currentUser } = useAuth();
  const [apiConnectionStatus, setApiConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [connectionDetails, setConnectionDetails] = useState<string | null>(null);

  // Check API connection on mount and on interval
  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        console.log("UserProfile: Checking API connection");
        setApiConnectionStatus('checking');
        
        const response = await fetchWithTimeout(`${API_URL}/health-check`, { 
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-cache' // Tránh cache khi kiểm tra sức khỏe API
        }, 5000); // 5 second timeout
        
        if (response.ok) {
          setApiConnectionStatus('connected');
          setConnectionDetails(null);
          console.log("UserProfile: API connection successful");
        } else {
          setApiConnectionStatus('disconnected');
          const text = await response.text();
          setConnectionDetails(`Máy chủ phản hồi với lỗi: ${response.status} ${response.statusText}`);
          console.warn('API health check failed:', text);
          toast.error("Máy chủ không phản hồi đúng. Hãy kiểm tra cài đặt của máy chủ MySQL.", { 
            duration: 8000 
          });
        }
      } catch (error) {
        console.error('API connection error:', error);
        setApiConnectionStatus('disconnected');
        setConnectionDetails(`Lỗi: ${(error as Error).message}`);
        toast.error("Không thể kết nối đến máy chủ. Hãy kiểm tra xem máy chủ đã chạy chưa.", { 
          duration: 8000 
        });
      }
    };
    
    checkApiConnection();
    
    // Thiết lập kiểm tra lại định kỳ
    const intervalId = setInterval(checkApiConnection, 15000); // Kiểm tra mỗi 15 giây
    
    return () => clearInterval(intervalId);
  }, []);

  // Manualy retry connection
  const retryConnection = async () => {
    try {
      setApiConnectionStatus('checking');
      toast.info("Đang kiểm tra kết nối với máy chủ...");
      
      const response = await fetchWithTimeout(`${API_URL}/health-check`, { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-cache'
      }, 5000);
      
      if (response.ok) {
        setApiConnectionStatus('connected');
        setConnectionDetails(null);
        toast.success("Đã kết nối thành công với máy chủ");
      } else {
        setApiConnectionStatus('disconnected');
        const text = await response.text();
        setConnectionDetails(`Máy chủ phản hồi với lỗi: ${response.status} ${response.statusText}`);
        throw new Error(`Máy chủ không phản hồi đúng: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Retry connection failed:', error);
      setApiConnectionStatus('disconnected');
      setConnectionDetails(`Lỗi: ${(error as Error).message}`);
      toast.error(`Không thể kết nối đến máy chủ: ${(error as Error).message}`);
    }
  };

  // Fetch enrolled courses from the database
  const fetchUserCourses = async () => {
    if (!currentUser?.id) return [];
    
    try {
      console.log("Fetching user courses for ID:", currentUser.id);
      const response = await fetchWithTimeout(`${API_URL}/users/${currentUser.id}/courses`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-cache'
      }, 8000);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch enrolled courses:', errorText);
        throw new Error('Failed to fetch enrolled courses');
      }
      
      const data = await response.json();
      console.log("Received user courses:", data);
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
      console.log("Fetching user certificates for ID:", currentUser.id);
      const response = await fetchWithTimeout(`${API_URL}/users/${currentUser.id}/certificates`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-cache'
      }, 8000);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch certificates:', errorText);
        throw new Error('Failed to fetch certificates');
      }
      
      const data = await response.json();
      console.log("Received user certificates:", data);
      return data.certificates || [];
    } catch (error) {
      console.error('Error fetching user certificates:', error);
      toast.error("Không thể tải dữ liệu chứng chỉ. Vui lòng kiểm tra kết nối đến máy chủ và thử lại sau.");
      return []; // Return empty array on error
    }
  };

  // Use React Query to fetch user courses
  const { data: userCourses, isLoading: isLoadingCourses } = useQuery({
    queryKey: ['userCourses', currentUser?.id, apiConnectionStatus],
    queryFn: fetchUserCourses,
    enabled: !!currentUser?.id && apiConnectionStatus === 'connected',
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Use React Query to fetch user certificates
  const { data: userCertificates, isLoading: isLoadingCertificates } = useQuery({
    queryKey: ['userCertificates', currentUser?.id, apiConnectionStatus],
    queryFn: fetchUserCertificates,
    enabled: !!currentUser?.id && apiConnectionStatus === 'connected',
    retry: 1,
    refetchOnWindowFocus: false,
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
              Không thể kết nối với máy chủ. Vui lòng kiểm tra máy chủ MySQL đã được cài đặt đúng chưa và máy chủ Express đã chạy chưa. Hãy xem file .env.example để biết cách cấu hình và tạo file .env.
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
              isLoadingCourses={isLoadingCourses || apiConnectionStatus !== 'connected'}
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
                      <span className="text-green-600 flex items-center">
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Đã kết nối với máy chủ
                      </span>
                    ) : apiConnectionStatus === 'checking' ? (
                      <span className="text-blue-600 flex items-center">
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        Đang kiểm tra kết nối...
                      </span>
                    ) : (
                      <span className="text-amber-600 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Không có kết nối
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="text-blue-600 p-0 ml-2 h-auto" 
                          onClick={retryConnection}
                        >
                          Thử lại
                        </Button>
                      </span>
                    )}
                  </span>
                </div>
              </div>
              
              {apiConnectionStatus === 'disconnected' && connectionDetails && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-md">
                  <h3 className="text-amber-800 font-medium mb-2 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Chi tiết lỗi kết nối
                  </h3>
                  <p className="text-amber-700 text-sm">{connectionDetails}</p>
                  <div className="mt-2 text-sm text-amber-700">
                    <p className="font-medium">Vui lòng kiểm tra:</p>
                    <ul className="list-disc pl-5 space-y-1 mt-1">
                      <li>Máy chủ MySQL đã được cài đặt và đang chạy</li>
                      <li>Tên người dùng và mật khẩu trong file .env là chính xác</li>
                      <li>Cổng 3000 không bị chặn bởi tường lửa</li>
                      <li>Đã tạo database theo hướng dẫn trong file .env.example</li>
                      <li>Máy chủ Express Node.js đang chạy (node server.js hoặc npm run dev)</li>
                    </ul>
                  </div>
                </div>
              )}
              
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
                    isLoading={isLoadingCertificates || apiConnectionStatus !== 'connected'}
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
