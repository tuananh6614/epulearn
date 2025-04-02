
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import ProfileForm from "@/components/ProfileForm";
import { SecurityForm } from "@/components/SecurityForm";
import { User as UserIcon, ShieldAlert } from 'lucide-react';

// Update to use default export
const UserProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Tài khoản của tôi</h1>
      
      <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile" className="flex items-center">
            <UserIcon className="mr-2 h-4 w-4" />
            Hồ sơ
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center">
            <ShieldAlert className="mr-2 h-4 w-4" />
            Bảo mật
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-4">
          <TabsContent value="profile">
            <Card>
              <CardContent className="pt-6">
                <ProfileForm />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security">
            <SecurityForm />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

// Add default export
export default UserProfile;
