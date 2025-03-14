
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VipActivationPendingProps {
  userEmail: string;
}

const VipActivationPending: React.FC<VipActivationPendingProps> = ({ userEmail }) => {
  return (
    <Card className="overflow-hidden">
      <div className="bg-yellow-500 h-2"></div>
      <CardContent className="p-6 pt-8">
        <div className="flex flex-col items-center justify-center space-y-6 text-center">
          <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
            <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-500" />
          </div>
          
          <div>
            <Badge className="mb-2 bg-yellow-500 hover:bg-yellow-600">Đang xử lý</Badge>
            <h2 className="text-2xl font-bold mb-2">Đang kích hoạt tài khoản VIP</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Cảm ơn bạn đã đăng ký gói VIP! Chúng tôi đang xử lý giao dịch của bạn.
            </p>
          </div>
          
          <div className="w-full max-w-md space-y-6">
            <div className="flex items-start gap-3">
              <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full mt-0.5">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-medium">Ghi nhận thanh toán</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Chúng tôi đã nhận được thông tin thanh toán của bạn
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-full mt-0.5">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-medium">Xác nhận thanh toán</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Hệ thống đang xác nhận giao dịch của bạn
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 opacity-50">
              <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full mt-0.5">
                <CheckCircle className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-medium">Kích hoạt tài khoản VIP</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Tài khoản của bạn sẽ được nâng cấp lên VIP sau khi xác nhận
                </p>
              </div>
            </div>
          </div>
          
          <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 text-left max-w-md mx-auto">
            <AlertTriangle className="h-4 w-4 text-blue-600 dark:text-blue-500" />
            <AlertDescription>
              Quá trình kích hoạt sẽ hoàn tất trong vòng 10 phút. Vui lòng tải lại trang sau khi nhận được email xác nhận từ chúng tôi.
            </AlertDescription>
          </Alert>
          
          <div className="pt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Một email xác nhận sẽ được gửi đến:
              <span className="font-medium ml-1 text-primary">{userEmail}</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VipActivationPending;
