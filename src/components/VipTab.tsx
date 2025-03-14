
import React, { useState, useCallback, memo, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Crown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import VipManager from './VipManager';
import VipActivationPending from './VipActivationPending';
import { formatDate } from '@/lib/utils';
import { checkVipAccess } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const VipStatusDisplay = memo(({ isVip, expirationDate, daysRemaining }: { 
  isVip: boolean, 
  expirationDate: Date | null,
  daysRemaining: number | null
}) => {
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
                {daysRemaining !== null && ` (còn ${daysRemaining} ngày)`}
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
  const [vipStatus, setVipStatus] = useState({ isVip: false, daysRemaining: null });
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkUserVipStatus = async () => {
      if (currentUser?.id) {
        setIsLoading(true);
        try {
          console.log('Checking VIP status for user:', currentUser.id);
          const status = await checkVipAccess(currentUser.id);
          console.log('VIP status result:', status);
          setVipStatus(status);
        } catch (error) {
          console.error('Error checking VIP status:', error);
          toast.error('Không thể kiểm tra trạng thái VIP');
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    
    checkUserVipStatus();
  }, [currentUser, refreshKey]);
  
  const handleVipStatusChanged = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);
  
  const handleActivationPending = useCallback(() => {
    setShowActivationPending(true);
  }, []);
  
  if (isLoading) {
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
  
  if (!currentUser) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="text-center py-4">
            <p className="text-muted-foreground">Vui lòng đăng nhập để xem trạng thái VIP</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (showActivationPending) {
    return <VipActivationPending userEmail={currentUser.email || ''} />;
  }
  
  const isUserVip = currentUser.isVip || vipStatus.isVip;
  const vipExpiration = currentUser.vipExpirationDate 
    ? new Date(currentUser.vipExpirationDate) 
    : null;
  
  return (
    <div className="space-y-6" key={refreshKey}>
      {/* Show VIP status at the top with days remaining */}
      <VipStatusDisplay 
        isVip={isUserVip} 
        expirationDate={vipExpiration}
        daysRemaining={vipStatus.daysRemaining}
      />
      
      <VipManager 
        userId={currentUser.id}
        userEmail={currentUser.email || ''}
        isCurrentUserVip={isUserVip}
        vipExpirationDate={vipExpiration}
        onVipStatusChanged={handleVipStatusChanged}
        onActivationPending={handleActivationPending}
      />
    </div>
  );
});

VipTab.displayName = 'VipTab';

export default VipTab;
