
import React, { useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { fetchUserEnrolledCourses, fetchUserCertificates } from '@/services/apiUtils';
import ProfileForm from '@/components/ProfileForm';
import SecurityForm from '@/components/SecurityForm';
import CertificatesTab from '@/components/CertificatesTab';
import VipTab from '@/components/VipTab';
import UserSidebar from '@/components/UserSidebar';
import { Loader2 } from 'lucide-react';

const UserProfile = React.memo(() => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
  }, []);

  // Optimized query with proper staleTime and appropriate key
  const { 
    data: enrolledCourses, 
    isLoading: coursesLoading 
  } = useQuery({
    queryKey: ['enrolledCourses', currentUser?.id],
    queryFn: () => currentUser?.id ? fetchUserEnrolledCourses(currentUser.id) : Promise.resolve([]),
    enabled: !!currentUser?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,  // 10 minutes
  });

  // Optimized certificates query with proper staleTime
  const { 
    data: certificates, 
    isLoading: certificatesLoading 
  } = useQuery({
    queryKey: ['certificates', currentUser?.id],
    queryFn: () => currentUser?.id ? fetchUserCertificates(currentUser.id) : Promise.resolve([]),
    enabled: !!currentUser?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,  // 10 minutes
  });

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-1/4">
            <UserSidebar 
              user={currentUser}
              enrolledCoursesCount={enrolledCourses?.length || 0}
              certificatesCount={certificates?.length || 0}
              isLoading={coursesLoading || certificatesLoading}
            />
          </div>
          
          <div className="w-full lg:w-3/4">
            <Card className="overflow-hidden shadow-sm dark:bg-gray-800">
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="profile">Hồ sơ</TabsTrigger>
                  <TabsTrigger value="security">Bảo mật</TabsTrigger>
                  <TabsTrigger value="certificates">Chứng chỉ</TabsTrigger>
                  <TabsTrigger value="vip">VIP</TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile" className="p-6">
                  <ProfileForm />
                </TabsContent>
                
                <TabsContent value="security" className="p-6">
                  <SecurityForm />
                </TabsContent>
                
                <TabsContent value="certificates" className="p-6">
                  {certificatesLoading ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                    </div>
                  ) : (
                    <CertificatesTab certificates={certificates || []} />
                  )}
                </TabsContent>
                
                <TabsContent value="vip" className="p-6">
                  <VipTab />
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
});

UserProfile.displayName = 'UserProfile';

export default UserProfile;
