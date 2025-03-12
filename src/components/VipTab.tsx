
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import VipManager from './VipManager';
import VipActivationPending from './VipActivationPending';

const VipTab = () => {
  const { currentUser } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [showActivationPending, setShowActivationPending] = useState(false);
  
  const handleVipStatusChanged = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  const handleActivationPending = () => {
    setShowActivationPending(true);
  };
  
  if (!currentUser) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (showActivationPending) {
    return <VipActivationPending userEmail={currentUser.email} />;
  }
  
  return (
    <div className="space-y-6" key={refreshKey}>
      <VipManager 
        userId={currentUser.id}
        userEmail={currentUser.email}
        isCurrentUserVip={!!currentUser.isVip}
        vipExpirationDate={currentUser.vipExpirationDate ? new Date(currentUser.vipExpirationDate) : null}
        onVipStatusChanged={handleVipStatusChanged}
        onActivationPending={handleActivationPending}
      />
    </div>
  );
};

export default VipTab;
