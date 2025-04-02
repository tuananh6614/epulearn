
import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { Crown, Check, UserCheck } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

interface VipManagerProps {
  userId: string;
  userEmail: string;
  isCurrentUserVip: boolean;
  vipExpirationDate: Date | null;
  onVipStatusChanged: () => void;
  onActivationPending: () => void;
}

const VipManager: React.FC<VipManagerProps> = React.memo(({ 
  userId, 
  userEmail, 
  isCurrentUserVip, 
  vipExpirationDate, 
  onVipStatusChanged,
  onActivationPending
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<string>("1-month");
  const [showSuccess, setShowSuccess] = useState(false);
  
  const durations = useMemo(() => ({
    "1-month": {
      label: "1 tháng",
      months: 1,
      planType: "vip1"
    },
    "3-months": {
      label: "3 tháng",
      months: 3,
      planType: "vip3"
    },
    "6-months": {
      label: "6 tháng",
      months: 6,
      planType: "vip6"
    },
    "1-year": {
      label: "1 năm",
      months: 12,
      planType: "vip1year"
    }
  }), []);
  
  const calculateExpiryDate = (months: number): Date => {
    const now = new Date();
    now.setMonth(now.getMonth() + months);
    return now;
  };
  
  const handleUpdateVipStatus = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      
      const duration = durations[selectedDuration as keyof typeof durations];
      const expiryDate = calculateExpiryDate(duration.months);
      
      // Record the VIP purchase in vip_purchases table
      // Using a mock implementation
      console.log(`[MOCK] Creating VIP purchase for user ${userId}, plan: ${duration.planType}`);
      
      // In a real implementation, we would use Supabase like this:
      // const { error: purchaseError } = await supabase
      //  .from('vip_purchases')
      //  .insert({
      //    user_id: userId,
      //    plan_type: duration.planType,
      //    amount: duration.months * 100000, 
      //    status: 'pending'
      //  });
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        // Show the activation pending component
        onActivationPending();
      }, 3000);
      
      // In a real scenario, this would be triggered by an admin approval
      // For this demo, we'll simulate it with a timeout
      setTimeout(async () => {
        try {
          // Cập nhật trạng thái VIP trong profiles
          // Using a mock implementation
          console.log(`[MOCK] Updating VIP status for user ${userId}`);
          
          // In a real implementation:
          // const { error: updateError } = await supabase
          //  .from('profiles')
          //  .update({ 
          //    is_vip: true,
          //    vip_expiration_date: expiryDate.toISOString()
          //  })
          //  .eq('id', userId);
          
          // Update the purchase record
          // In a real implementation:
          // const { error: purchaseUpdateError } = await supabase
          //  .from('vip_purchases')
          //  .update({
          //    status: 'active',
          //    activation_date: new Date().toISOString()
          //  })
          //  .eq('user_id', userId)
          //  .eq('status', 'pending');
            
        } catch (error) {
          console.error('Error activating VIP status:', error);
        }
      }, 10 * 60 * 1000); // 10 minutes
      
    } catch (error) {
      console.error('Error when updating VIP status:', error);
      toast.error('Cannot update VIP status. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVip = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      
      // Update VIP status in profiles - using a mock implementation
      console.log(`[MOCK] Removing VIP status for user ${userId}`);
      
      // In a real implementation:
      // const { error: updateError } = await supabase
      //  .from('profiles')
      //  .update({ 
      //    is_vip: false,
      //    vip_expiration_date: null
      //  })
      //  .eq('id', userId);
      
      // Update related vip_purchases to expired
      // In a real implementation:
      // const { error: purchaseUpdateError } = await supabase
      //  .from('vip_purchases')
      //  .update({
      //    status: 'expired'
      //  })
      //  .eq('user_id', userId)
      //  .eq('status', 'active');
        
      toast.success('VIP access has been removed successfully');
      onVipStatusChanged();
      
    } catch (error) {
      console.error('Error when removing VIP access:', error);
      toast.error('Cannot remove VIP access. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  if (showSuccess) {
    return (
      <Card className="mb-6 overflow-hidden">
        <div className="bg-green-500 h-2" />
        <CardContent className="py-6">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
              <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-xl font-medium">VIP access update successful!</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                User will have VIP access activated within a few minutes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Calculate days remaining for VIP
  const daysRemaining = useMemo(() => {
    if (!vipExpirationDate) return null;
    return Math.ceil((vipExpirationDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
  }, [vipExpirationDate]);
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-500" />
          <span>VIP Access Management</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isCurrentUserVip ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
              <div>
                <p className="font-medium">User currently has VIP access</p>
                {vipExpirationDate && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Expires: {vipExpirationDate.toLocaleDateString()} 
                    {daysRemaining !== null && ` (${daysRemaining} days remaining)`}
                  </p>
                )}
              </div>
            </div>
            
            <Button 
              variant="destructive" 
              onClick={handleRemoveVip} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Processing...' : 'Remove VIP Access'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Select VIP duration for user:
            </p>
            <RadioGroup 
              value={selectedDuration} 
              onValueChange={setSelectedDuration}
              className="grid grid-cols-2 gap-2"
            >
              {Object.entries(durations).map(([key, { label }]) => (
                <div key={key} className="flex items-center space-x-2">
                  <RadioGroupItem value={key} id={key} />
                  <Label htmlFor={key}>{label}</Label>
                </div>
              ))}
            </RadioGroup>
            
            <Button 
              onClick={handleUpdateVipStatus} 
              disabled={loading}
              className="w-full bg-yellow-600 hover:bg-yellow-700"
            >
              {loading ? 'Processing...' : 'Grant VIP Access'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

VipManager.displayName = 'VipManager';

export default VipManager;
