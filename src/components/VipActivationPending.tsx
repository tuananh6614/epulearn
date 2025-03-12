
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Timer, Crown } from 'lucide-react';

interface VipActivationPendingProps {
  userEmail: string;
}

const VipActivationPending: React.FC<VipActivationPendingProps> = ({ userEmail }) => {
  const [remainingTime, setRemainingTime] = useState<number>(10 * 60); // 10 phút = 600 giây
  
  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-r from-yellow-500 to-amber-500 h-2" />
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
            {remainingTime > 0 ? (
              <Timer className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            ) : (
              <Crown className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            )}
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-2">
              {remainingTime > 0 ? "Đang chờ kích hoạt VIP" : "VIP đã sẵn sàng!"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {remainingTime > 0 ? (
                <>
                  Yêu cầu của bạn đang được xử lý. Trạng thái VIP sẽ được kích hoạt trong vòng:
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
                    {formatTime(remainingTime)}
                  </div>
                </>
              ) : (
                <>
                  Tài khoản VIP của bạn đã được kích hoạt!<br />
                  Vui lòng làm mới trang để xem các quyền lợi của bạn.
                </>
              )}
            </p>
          </div>
          
          {remainingTime === 0 && (
            <p className="text-sm text-gray-500">
              Nếu biểu tượng VIP chưa xuất hiện, hãy làm mới trang hoặc đăng nhập lại.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VipActivationPending;
