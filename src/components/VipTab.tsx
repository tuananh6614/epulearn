
import React, { useState, useCallback, memo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Crown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import VipManager from './VipManager';
import VipActivationPending from './VipActivationPending';
import { formatDate } from '@/lib/utils';

const VipStatusDisplay = memo(({ isVip, expirationDate }: { isVip: boolean, expirationDate: Date | null }) => {
  return (
    <Card className="mb-6 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-4">
          <div className={`p-4 rounded-full ${isVip ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-500'}`}>
            <Crown className="h-8 w-8" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">
              {isVip ? 'Tài khoản VIP' : 'Tài khoản Thường'}
            </h3>
            {isVip && expirationDate && (
              <p className="text-sm text-gray-500">
                Thời hạn VIP: đến {formatDate(expirationDate)}
              </p>
            )}
            {!isVip && (
              <p className="text-sm text-gray-500">
                Nâng cấp lên VIP để truy cập tất cả các khóa học cao cấp
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

VipStatusDisplay.displayName = 'VipStatusDisplay';

const VipTab = memo(() => {
  const { currentUser } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [showActivationPending, setShowActivationPending] = useState(false);
  
  const handleVipStatusChanged = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);
  
  const handleActivationPending = useCallback(() => {
    setShowActivationPending(true);
  }, []);
  
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
    return <VipActivationPending userEmail={currentUser.email || ''} />;
  }
  
  return (
    <div className="space-y-6" key={refreshKey}>
      {/* Show VIP status at the top */}
      <VipStatusDisplay 
        isVip={!!currentUser.isVip} 
        expirationDate={currentUser.vipExpirationDate ? new Date(currentUser.vipExpirationDate) : null} 
      />
      
      <VipManager 
        userId={currentUser.id}
        userEmail={currentUser.email || ''}
        isCurrentUserVip={!!currentUser.isVip}
        vipExpirationDate={currentUser.vipExpirationDate ? new Date(currentUser.vipExpirationDate) : null}
        onVipStatusChanged={handleVipStatusChanged}
        onActivationPending={handleActivationPending}
      />
    </div>
  );
});

VipTab.displayName = 'VipTab';

export default VipTab;
