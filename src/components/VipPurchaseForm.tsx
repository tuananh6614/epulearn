
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, CheckCircle, Clock, QrCode, Download, Share2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import VipActivationPending from './VipActivationPending';
import { Alert, AlertDescription } from "@/components/ui/alert";

// QR codes for different plans
const QR_CODE_IMAGES = {
  "1-month": "/lovable-uploads/a49f5bd6-e4ae-4a5e-8f6a-3669ecdd8196.png",
  "3-months": "/lovable-uploads/a49f5bd6-e4ae-4a5e-8f6a-3669ecdd8196.png",
  "6-months": "/lovable-uploads/a49f5bd6-e4ae-4a5e-8f6a-3669ecdd8196.png",
  "1-year": "/lovable-uploads/a49f5bd6-e4ae-4a5e-8f6a-3669ecdd8196.png"
};

interface VipPlanProps {
  duration: string;
  months: number;
  price: number;
  discount?: number;
  features: string[];
  isPopular?: boolean;
  isTrial?: boolean;
  onSelect: () => void;
}

const VipPlan: React.FC<VipPlanProps> = ({ 
  duration, 
  months, 
  price, 
  discount = 0, 
  features, 
  isPopular = false,
  isTrial = false,
  onSelect
}) => {
  const finalPrice = discount > 0 ? price - (price * discount / 100) : price;
  
  return (
    <Card className={`relative h-full ${isPopular ? 'border-2 border-yellow-500 dark:border-yellow-600' : 'border'}`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium">
          Phổ biến nhất
        </div>
      )}
      {isTrial && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
          Dùng thử
        </div>
      )}
      
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className={`h-5 w-5 ${isPopular ? 'text-yellow-500' : isTrial ? 'text-blue-500' : 'text-blue-500'}`} />
          <span>Gói {duration}</span>
        </CardTitle>
        <CardDescription>Truy cập tất cả khóa học VIP trong {months} tháng</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-end gap-2">
          <div className="text-3xl font-bold">{finalPrice.toLocaleString('vi-VN')}₫</div>
          {discount > 0 && (
            <span className="text-sm text-muted-foreground line-through">{price.toLocaleString('vi-VN')}₫</span>
          )}
        </div>
        
        {discount > 0 && (
          <div className="inline-block bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs px-2 py-1 rounded">
            Tiết kiệm {discount}%
          </div>
        )}
        
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-1 shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={onSelect}
          className={`w-full ${isPopular ? 'bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-800' : ''}`}
        >
          Chọn gói này
        </Button>
      </CardFooter>
    </Card>
  );
};

const VipPurchaseForm = () => {
  const { currentUser } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string>("6-months");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showActivationPending, setShowActivationPending] = useState(false);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  
  const plans = {
    "1-month": {
      title: "1 Tháng (Dùng thử)",
      months: 1,
      price: 99000,
      discount: 0,
      isTrial: true,
      features: [
        "Truy cập đầy đủ tất cả khóa học VIP",
        "Bài kiểm tra cơ bản",
        "Hỗ trợ email",
      ]
    },
    "3-months": {
      title: "3 Tháng",
      months: 3,
      price: 500000,
      discount: 0,
      features: [
        "Truy cập đầy đủ tất cả khóa học VIP",
        "Bài kiểm tra và đánh giá chuyên sâu",
        "Hỗ trợ trực tiếp từ giảng viên",
        "Chứng chỉ hoàn thành khóa học"
      ]
    },
    "6-months": {
      title: "6 Tháng",
      months: 6,
      price: 900000,
      discount: 10,
      isPopular: true,
      features: [
        "Truy cập đầy đủ tất cả khóa học VIP",
        "Bài kiểm tra và đánh giá chuyên sâu",
        "Hỗ trợ trực tiếp từ giảng viên",
        "Chứng chỉ hoàn thành khóa học",
        "Ưu tiên tiếp cận khóa học mới"
      ]
    },
    "1-year": {
      title: "1 Năm",
      months: 12,
      price: 2000000,
      discount: 20,
      features: [
        "Truy cập đầy đủ tất cả khóa học VIP",
        "Bài kiểm tra và đánh giá chuyên sâu",
        "Hỗ trợ trực tiếp từ giảng viên",
        "Chứng chỉ hoàn thành khóa học",
        "Ưu tiên tiếp cận khóa học mới",
        "Tài liệu bổ sung độc quyền",
        "Tư vấn học tập 1-1"
      ]
    }
  };
  
  // Simulate payment verification (in real app, this would check with payment API)
  const verifyPayment = async () => {
    setIsLoading(true);
    
    try {
      // Simulating API call to payment gateway
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 90% chance of success for demonstration
      const isSuccessful = Math.random() < 0.9;
      
      if (isSuccessful) {
        setPaymentVerified(true);
        setPaymentError(null);
        
        // Show success toast
        toast.success("Thanh toán đã được xác nhận!", {
          description: "Cảm ơn bạn đã đăng ký gói VIP."
        });
        
        // Record payment in database
        await recordSuccessfulPayment();
        
        // Show activation message
        setShowActivationPending(true);
      } else {
        setPaymentVerified(false);
        setPaymentError("Không thể xác nhận thanh toán. Vui lòng kiểm tra lại thông tin chuyển khoản.");
        
        toast.error("Không thể xác nhận thanh toán", {
          description: "Vui lòng kiểm tra lại thông tin chuyển khoản của bạn."
        });
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      setPaymentVerified(false);
      setPaymentError("Đã xảy ra lỗi khi xác nhận thanh toán. Vui lòng thử lại sau.");
      
      toast.error("Lỗi hệ thống", {
        description: "Đã xảy ra lỗi khi xác nhận thanh toán. Vui lòng thử lại sau."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const recordSuccessfulPayment = async () => {
    if (!currentUser) return;
    
    try {
      const plan = plans[selectedPlan as keyof typeof plans];
      const finalPrice = plan.discount > 0 
        ? plan.price - (plan.price * plan.discount / 100) 
        : plan.price;
      
      // Record the purchase
      const { error: purchaseError } = await supabase
        .from('vip_purchases')
        .insert({
          user_id: currentUser.id,
          plan_type: selectedPlan,
          amount: finalPrice,
          status: 'confirmed',
          purchase_date: new Date().toISOString(),
          activation_date: new Date().toISOString()
        });
      
      if (purchaseError) throw purchaseError;
      
      // Create a user_courses entry for VIP subscription tracking
      const { error: courseError } = await supabase
        .from('user_courses')
        .insert({
          user_id: currentUser.id,
          course_id: `vip-${selectedPlan}`,
          has_paid: true,
          payment_amount: finalPrice,
          progress_percentage: 0,
          enrolled_at: new Date().toISOString(),
          payment_date: new Date().toISOString()
        });
      
      if (courseError) throw courseError;
      
      // Activate VIP status immediately
      activateVip(plan.months);
      
    } catch (error) {
      console.error("Error recording payment:", error);
    }
  };
  
  const handleSubmitPurchase = async () => {
    if (!currentUser) {
      toast.error("Vui lòng đăng nhập để mua gói VIP");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const plan = plans[selectedPlan as keyof typeof plans];
      const finalPrice = plan.discount > 0 
        ? plan.price - (plan.price * plan.discount / 100) 
        : plan.price;
      
      // Record the pending purchase
      const { error: purchaseError } = await supabase
        .from('vip_purchases')
        .insert({
          user_id: currentUser.id,
          plan_type: selectedPlan,
          amount: finalPrice,
          status: 'pending',
          purchase_date: new Date().toISOString()
        });
      
      if (purchaseError) throw purchaseError;
      
      // Record in user_courses for tracking
      const { error: courseError } = await supabase
        .from('user_courses')
        .insert({
          user_id: currentUser.id,
          course_id: `vip-${selectedPlan}`,
          has_paid: false,
          payment_amount: finalPrice,
          progress_percentage: 0,
          enrolled_at: new Date().toISOString()
        });
      
      if (courseError) throw courseError;
      
      // Verify payment (this will be called immediately for demo purposes)
      // In a real app this might be replaced with a webhook or manual verification
      await verifyPayment();
      
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("Không thể xử lý giao dịch. Vui lòng thử lại sau.");
      setIsLoading(false);
    }
  };
  
  const activateVip = async (months: number) => {
    if (!currentUser) return;
    
    try {
      const expirationDate = new Date();
      expirationDate.setMonth(expirationDate.getMonth() + months);
      
      await supabase
        .from('profiles')
        .update({ 
          is_vip: true,
          vip_expiration_date: expirationDate.toISOString()
        })
        .eq('id', currentUser.id);
        
      await supabase
        .from('user_courses')
        .update({
          has_paid: true,
          payment_date: new Date().toISOString()
        })
        .eq('user_id', currentUser.id)
        .eq('course_id', `vip-${selectedPlan}`);
      
      toast.success("Tài khoản VIP đã được kích hoạt!", {
        description: `Tài khoản của bạn đã được nâng cấp lên VIP và có hiệu lực đến ${expirationDate.toLocaleDateString('vi-VN')}`
      });
      
    } catch (error) {
      console.error("Lỗi khi kích hoạt VIP:", error);
    }
  };
  
  const handleSelectPlan = (plan: string) => {
    setSelectedPlan(plan);
    setPaymentError(null); // Reset any payment errors when switching plans
  };
  
  const handleDownloadQR = () => {
    const qrImage = QR_CODE_IMAGES[selectedPlan as keyof typeof QR_CODE_IMAGES] || QR_CODE_IMAGES["6-months"];
    
    const a = document.createElement('a');
    a.href = qrImage;
    a.download = `qr-thanh-toan-vip-${selectedPlan}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast("Đã tải xuống mã QR");
  };
  
  if (showActivationPending) {
    return (
      <div className="container mx-auto py-8 max-w-md">
        <VipActivationPending userEmail={currentUser?.email || ''} />
      </div>
    );
  }
  
  if (showSuccessMessage) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-500" />
        </div>
        <h2 className="text-2xl font-bold">Cảm ơn bạn!</h2>
        <p className="text-muted-foreground">
          Chúng tôi đã ghi nhận yêu cầu mua gói VIP của bạn.
          <br />Tài khoản của bạn sẽ được kích hoạt trong vòng 10 phút sau khi xác nhận thanh toán.
        </p>
        <Button 
          onClick={() => setShowSuccessMessage(false)} 
          variant="outline" 
          className="mt-4"
        >
          Quay lại
        </Button>
      </div>
    );
  }
  
  // Get the current QR code based on selected plan
  const currentQRCode = QR_CODE_IMAGES[selectedPlan as keyof typeof QR_CODE_IMAGES] || QR_CODE_IMAGES["6-months"];
  
  return (
    <div className="container mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Đăng ký gói học VIP</h2>
      
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <VipPlan
            duration={plans["1-month"].title}
            months={plans["1-month"].months}
            price={plans["1-month"].price}
            features={plans["1-month"].features}
            onSelect={() => handleSelectPlan("1-month")}
            isPopular={false}
            isTrial={true}
          />
          
          <VipPlan
            duration={plans["3-months"].title}
            months={plans["3-months"].months}
            price={plans["3-months"].price}
            features={plans["3-months"].features}
            onSelect={() => handleSelectPlan("3-months")}
            isPopular={false}
          />
          
          <VipPlan
            duration={plans["6-months"].title}
            months={plans["6-months"].months}
            price={plans["6-months"].price}
            discount={plans["6-months"].discount}
            features={plans["6-months"].features}
            onSelect={() => handleSelectPlan("6-months")}
            isPopular={true}
          />
          
          <VipPlan
            duration={plans["1-year"].title}
            months={plans["1-year"].months}
            price={plans["1-year"].price}
            discount={plans["1-year"].discount}
            features={plans["1-year"].features}
            onSelect={() => handleSelectPlan("1-year")}
            isPopular={false}
          />
        </div>
        
        {paymentError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{paymentError}</AlertDescription>
          </Alert>
        )}
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-blue-500" />
              Thanh toán qua mã QR
            </CardTitle>
            <CardDescription>
              Quét mã QR hoặc chuyển khoản đến tài khoản ngân hàng bên dưới
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="qr" className="w-full">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="qr" className="flex-1">Mã QR</TabsTrigger>
                <TabsTrigger value="bank" className="flex-1">Thông tin chuyển khoản</TabsTrigger>
              </TabsList>
              
              <TabsContent value="qr" className="flex flex-col items-center">
                <div className="bg-white p-4 rounded-md mb-4">
                  <img src={currentQRCode} alt="QR Code" className="w-56 h-56 object-contain" />
                  <p className="text-center text-sm mt-2 text-gray-500">
                    Mã QR cho gói {plans[selectedPlan as keyof typeof plans].title}
                  </p>
                </div>
                
                <div className="flex flex-wrap justify-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleDownloadQR}>
                    <Download className="h-4 w-4 mr-2" />
                    Tải mã QR
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {
                    const selectedPlanDetails = plans[selectedPlan as keyof typeof plans];
                    const finalPrice = selectedPlanDetails.discount > 0 
                      ? selectedPlanDetails.price - (selectedPlanDetails.price * selectedPlanDetails.discount / 100) 
                      : selectedPlanDetails.price;
                    
                    navigator.clipboard.writeText(`VIB - 339435005 - NGUYEN TUAN ANH - ${finalPrice.toLocaleString('vi-VN')}đ`);
                    toast("Đã sao chép thông tin chuyển khoản");
                  }}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Sao chép thông tin
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="bank">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Ngân hàng</p>
                      <p className="text-sm bg-muted p-2 rounded">VIB (Vietnam International Bank)</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Số tài khoản</p>
                      <p className="text-sm bg-muted p-2 rounded">339435005</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Chủ tài khoản</p>
                      <p className="text-sm bg-muted p-2 rounded">NGUYEN TUAN ANH</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Số tiền</p>
                      <p className="text-sm bg-muted p-2 rounded font-medium">
                        {(() => {
                          const selectedPlanDetails = plans[selectedPlan as keyof typeof plans];
                          const finalPrice = selectedPlanDetails.discount > 0 
                            ? selectedPlanDetails.price - (selectedPlanDetails.price * selectedPlanDetails.discount / 100) 
                            : selectedPlanDetails.price;
                          return `${finalPrice.toLocaleString('vi-VN')}đ`;
                        })()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Nội dung chuyển khoản</p>
                    <p className="text-sm bg-muted p-2 rounded">
                      {currentUser ? `VIP_${selectedPlan}_${currentUser.email.split('@')[0]}` : "VIP_[your-email]"}
                    </p>
                  </div>
                  
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-3 text-sm text-yellow-800 dark:text-yellow-200">
                    <p className="font-medium mb-1">Lưu ý quan trọng:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Vui lòng ghi đúng nội dung chuyển khoản để chúng tôi có thể xác nhận thanh toán của bạn.</li>
                      <li>Sau khi chuyển khoản, hãy nhấn "Xác nhận đã thanh toán" bên dưới.</li>
                      <li>Tài khoản VIP của bạn sẽ được kích hoạt ngay sau khi xác nhận thanh toán thành công.</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <div className="text-center">
          <Button 
            size="lg" 
            onClick={handleSubmitPurchase}
            disabled={isLoading}
            className="bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-800"
          >
            {isLoading ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              "Xác nhận đã thanh toán"
            )}
          </Button>
          
          <p className="text-xs text-muted-foreground mt-4">
            Bằng cách nhấn nút xác nhận, bạn đồng ý với 
            <a href="#" className="underline ml-1">Điều khoản sử dụng</a> của chúng tôi.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VipPurchaseForm;
