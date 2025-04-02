
import React, { useState, useCallback, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { fetchUserEnrolledCourses, checkApiHealth } from '@/services/apiUtils';
import ProfileForm from '@/components/ProfileForm';
import SecurityForm from '@/components/SecurityForm';
import VipTab from '@/components/VipTab';
import UserSidebar from '@/components/UserSidebar';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const UserProfile = React.memo(() => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [isRetrying, setIsRetrying] = useState(false);
  const [apiHealthy, setApiHealthy] = useState(true);
  
  // Kiểm tra sức khỏe của API trước khi tải dữ liệu
  useEffect(() => {
    const checkHealth = async () => {
      const isHealthy = await checkApiHealth();
      setApiHealthy(isHealthy);
      if (!isHealthy) {
        toast.error("Không thể kết nối tới máy chủ. Một số tính năng có thể không hoạt động.");
      }
    };
    
    checkHealth();
  }, []);
  
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
  }, []);

  // Xử lý thử lại khi gặp lỗi
  const handleRetry = () => {
    setIsRetrying(true);
    // Làm mới danh sách khóa học
    enrolledCoursesRefetch().then(() => {
      setIsRetrying(false);
      toast.success("Đã làm mới dữ liệu");
    });
  };

  // Optimized query with proper staleTime and appropriate key
  const { 
    data: enrolledCourses, 
    isLoading: coursesLoading,
    error: coursesError,
    refetch: enrolledCoursesRefetch
  } = useQuery({
    queryKey: ['enrolledCourses', currentUser?.id],
    queryFn: () => currentUser?.id ? fetchUserEnrolledCourses(currentUser.id) : Promise.resolve([]),
    enabled: !!currentUser?.id && apiHealthy,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,  // 5 minutes
    retry: 1, // Giảm số lần thử lại xuống 1
  });

  const hasError = coursesError;

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        {hasError && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <div className="flex-grow">
              <p>Không thể tải dữ liệu từ máy chủ. Vui lòng thử lại sau.</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRetry} 
              disabled={isRetrying}
              className="ml-4 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"
            >
              {isRetrying ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Đang thử lại</>
              ) : (
                <><RefreshCw className="h-4 w-4 mr-2" /> Thử lại</>
              )}
            </Button>
          </div>
        )}
        
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-1/4">
            <UserSidebar 
              enrolledCoursesCount={enrolledCourses?.length || 0}
              isLoading={coursesLoading}
            />
          </div>
          
          <div className="w-full lg:w-3/4">
            <Card className="overflow-hidden shadow-sm dark:bg-gray-800">
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="profile">Hồ sơ</TabsTrigger>
                  <TabsTrigger value="security">Bảo mật</TabsTrigger>
                  <TabsTrigger value="vip">VIP</TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile" className="p-6">
                  <ProfileForm />
                </TabsContent>
                
                <TabsContent value="security" className="p-6">
                  <SecurityForm />
                </TabsContent>
                
                <TabsContent value="vip" className="p-6">
                  <VipTab />
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
});

UserProfile.displayName = 'UserProfile';

export default UserProfile;
