
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { Crown, Check, Timer, UserCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from "@/integrations/supabase/client";

interface VipManagerProps {
  userId: string;
  userEmail: string;
  isCurrentUserVip: boolean;
  vipExpirationDate: Date | null;
  onVipStatusChanged: () => void;
}

const VipManager: React.FC<VipManagerProps> = ({ 
  userId, 
  userEmail, 
  isCurrentUserVip, 
  vipExpirationDate, 
  onVipStatusChanged 
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<string>("1-month");
  const [showSuccess, setShowSuccess] = useState(false);
  
  const durations = {
    "1-month": {
      label: "1 tháng",
      months: 1,
    },
    "3-months": {
      label: "3 tháng",
      months: 3,
    },
    "6-months": {
      label: "6 tháng",
      months: 6,
    },
    "1-year": {
      label: "1 năm",
      months: 12,
    }
  };
  
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
      
      // Cập nhật trạng thái VIP trong profiles
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          is_vip: true,
          vip_expiration_date: expiryDate.toISOString()
        })
        .eq('id', userId);
      
      if (updateError) throw updateError;
      
      // Thêm bản ghi trong user_courses cho VIP
      const vipCourseId = `vip-${selectedDuration}`;
      const { error: insertError } = await supabase
        .from('user_courses')
        .insert({
          user_id: userId,
          course_id: vipCourseId,
          has_paid: true,
          payment_amount: 0, // Admin set nên không tính phí
          payment_date: new Date().toISOString(),
          enrolled_at: new Date().toISOString(),
          progress_percentage: 0
        });
        
      if (insertError) throw insertError;
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onVipStatusChanged();
      }, 3000);
      
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái VIP:', error);
      toast.error('Không thể cập nhật trạng thái VIP. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVip = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      
      // Cập nhật trạng thái VIP trong profiles
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          is_vip: false,
          vip_expiration_date: null
        })
        .eq('id', userId);
      
      if (updateError) throw updateError;
      
      toast.success('Đã hủy quyền VIP thành công');
      onVipStatusChanged();
      
    } catch (error) {
      console.error('Lỗi khi hủy quyền VIP:', error);
      toast.error('Không thể hủy quyền VIP. Vui lòng thử lại sau.');
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
              <h3 className="text-xl font-medium">Cập nhật quyền VIP thành công!</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Người dùng sẽ được kích hoạt quyền VIP trong vài phút.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-500" />
          <span>Quản lý quyền VIP</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isCurrentUserVip ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
              <div>
                <p className="font-medium">Người dùng hiện đang có quyền VIP</p>
                {vipExpirationDate && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Hết hạn: {new Date(vipExpirationDate).toLocaleDateString('vi-VN')}
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
              {loading ? 'Đang xử lý...' : 'Hủy quyền VIP'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Chọn thời hạn VIP cho người dùng:
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
              {loading ? 'Đang xử lý...' : 'Cấp quyền VIP'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VipManager;
