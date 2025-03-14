
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Timer, Crown, CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

interface VipActivationPendingProps {
  userEmail: string;
}

const VipActivationPending: React.FC<VipActivationPendingProps> = ({ userEmail }) => {
  const [remainingTime, setRemainingTime] = useState<number>(30); // Reduced to 30 seconds for better demo
  const navigate = useNavigate();
  
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
  
  const handleReturnToHome = () => {
    navigate('/');
  };
  
  const handleBrowseCourses = () => {
    navigate('/vip-courses');
  };
  
  return (
    <Card className="overflow-hidden shadow-lg border-2 border-yellow-100 dark:border-yellow-900/30">
      <div className="bg-gradient-to-r from-yellow-500 to-amber-500 h-2" />
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
            {remainingTime > 0 ? (
              <Timer className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            ) : (
              <Crown className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            )}
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-2">
              {remainingTime > 0 ? "Đang kích hoạt tài khoản VIP" : "Tài khoản VIP đã sẵn sàng!"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {remainingTime > 0 ? (
                <>
                  Cảm ơn bạn đã thanh toán! Hệ thống đang xử lý và kích hoạt VIP:
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
                    {formatTime(remainingTime)}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-center mb-2">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                  Tài khoản VIP của bạn đã được kích hoạt thành công!<br />
                  Bạn đã có thể truy cập tất cả các khóa học VIP.
                </>
              )}
            </p>
          </div>
          
          {remainingTime === 0 && (
            <div className="space-y-3 w-full mt-2">
              <Button 
                variant="default" 
                className="w-full bg-yellow-600 hover:bg-yellow-700"
                onClick={handleBrowseCourses}
              >
                <Crown className="h-4 w-4 mr-2" /> Khám phá khóa học VIP
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleReturnToHome}
              >
                Về trang chủ
              </Button>
            </div>
          )}
          
          {remainingTime > 0 && (
            <p className="text-sm text-gray-500 mt-4 italic">
              Quá trình kích hoạt chỉ mất vài giây. Vui lòng không tải lại trang.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VipActivationPending;
