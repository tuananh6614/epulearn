import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, CheckCircle, Clock, QrCode, Download, Share2, AlertCircle, ArrowUpRight, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, checkVipAccess, VipStatus } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import VipActivationPending from './VipActivationPending';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

const QR_CODE_IMAGES = {
  "1-month": "/lovable-uploads/image.png",
  "3-months": "/lovable-uploads/image.png",
  "6-months": "/lovable-uploads/image.png",
  "1-year": "/lovable-uploads/image.png"
};

interface VipPlanProps {
  duration: string;
  months: number;
  price: number;
  discount?: number;
  features: string[];
  isPopular?: boolean;
  isTrial?: boolean;
  isUpgrade?: boolean;
  onSelect: () => void;
}

interface VipPlanType {
  title: string;
  months: number;
  price: number;
  discount: number;
  features: string[];
  isPopular?: boolean;
  isTrial?: boolean;
  isUpgrade?: boolean;
  isActive?: boolean;
}

interface VipPlansType {
  [key: string]: VipPlanType;
}

const VipPlan: React.FC<VipPlanProps> = ({ 
  duration, 
  months, 
  price, 
  discount = 0, 
  features, 
  isPopular = false,
  isTrial = false,
  isUpgrade = false,
  onSelect
}) => {
  const finalPrice = discount > 0 ? price - (price * discount / 100) : price;
  
  return (
    <Card className={`relative h-full transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
      isPopular ? 'border-4 border-yellow-500 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20' : 
      isUpgrade ? 'border-4 border-green-500 dark:border-green-600 bg-green-50 dark:bg-green-900/20' : 
      'border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
    }`}>
      {/* Badge hiển thị ở góc trên bên phải, không đè lên khung */}
      <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/2 z-10">
        {isPopular && (
          <Badge className="bg-yellow-500 text-white px-4 py-1 rounded-full text-xs font-medium shadow-md">
            Phổ biến nhất
          </Badge>
        )}
        {isTrial && (
          <Badge className="bg-blue-500 text-white px-4 py-1 rounded-full text-xs font-medium shadow-md">
            Dùng thử
          </Badge>
        )}
        {isUpgrade && (
          <Badge className="bg-green-500 text-white px-4 py-1 rounded-full text-xs font-medium shadow-md flex items-center gap-1">
            <ArrowUpRight className="h-3 w-3" />
            Nâng cấp
          </Badge>
        )}
      </div>
      
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
          <Crown className={`h-6 w-6 ${
            isPopular ? 'text-yellow-500' : 
            isUpgrade ? 'text-green-500' : 
            isTrial ? 'text-blue-500' : 'text-blue-500'
          }`} />
          <span>{duration}</span>
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          Truy cập tất cả khóa học VIP trong {months} tháng
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-5 p-6"> {/* Tăng padding để có thêm không gian */}
        <div className="flex flex-col items-start gap-2">
          <div className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            {finalPrice.toLocaleString('vi-VN')}đ
          </div>
          {discount > 0 && (
            <span className="text-lg text-gray-500 dark:text-gray-400 line-through">
              {price.toLocaleString('vi-VN')}đ
            </span>
          )}
        </div>
        
        {discount > 0 && (
          <Badge variant="outline" className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-sm px-3 py-1 rounded-full">
            Tiết kiệm {discount}%
          </Badge>
        )}
        
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={onSelect}
          className={`w-full text-lg font-semibold py-3 ${
            isPopular ? 'bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-800' : 
            isUpgrade ? 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800' : 
            'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'
          }`}
        >
          {isUpgrade ? 'Nâng cấp gói này' : 'Chọn gói này'}
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
  const [vipStatus, setVipStatus] = useState<VipStatus>({ isVip: false, daysRemaining: null });
  const [currentVipPlan, setCurrentVipPlan] = useState<string | null>(null);
  
  useEffect(() => {
    const loadVipStatus = async () => {
      if (currentUser?.id) {
        const status = await checkVipAccess(currentUser.id);
        setVipStatus(status);
        
        if (status.isVip) {
          const { data } = await supabase
            .from('vip_purchases')
            .select('plan_type')
            .eq('user_id', currentUser.id)
            .eq('status', 'active')
            .order('activation_date', { ascending: false })
            .limit(1);
            
          if (data && data.length > 0) {
            setCurrentVipPlan(data[0].plan_type);
          }
        }
      }
    };
    
    loadVipStatus();
  }, [currentUser]);
  
  const basePlans: VipPlansType = {
    "1-month": {
      title: "7 Ngày (Dùng thử)",
      months: 1,
      price: 50000,
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
      price: 600000, // Giá gốc mới từ hình ảnh
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
      price: 1200000, // Giá gốc mới từ hình ảnh
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
      price: 2400000, // Giá gốc giữ nguyên
      discount: 30,
      features: [
        "Truy cập đầy đủ tất cả khóa học VIP",
        "Hỗ trợ trực tiếp từ giảng viên",
        "Chứng chỉ hoàn thành khóa học",
        "Ưu tiên tiếp cận khóa học mới",
        "Tài liệu bổ sung độc quyền",
        "Tư vấn học tập 1-1"
      ]
    }
  };
  
  const getAdjustedPlans = () => {
    if (!vipStatus.isVip) {
      return basePlans;
    }
    
    const adjustedPlans = {...basePlans};
    
    const currentMonths = 
      currentVipPlan === "vip1" || currentVipPlan === "1-month" ? 1 :
      currentVipPlan === "vip3" || currentVipPlan === "3-months" ? 3 :
      currentVipPlan === "vip6" || currentVipPlan === "6-months" ? 6 :
      currentVipPlan === "vip1year" || currentVipPlan === "1-year" ? 12 : 0;
    
    Object.keys(adjustedPlans).forEach(planKey => {
      const plan = adjustedPlans[planKey];
      
      if (plan.months > currentMonths) {
        const additionalDiscount = 
          plan.months <= 3 ? 5 : 
          plan.months <= 6 ? 10 : 15;
        
        if (vipStatus.daysRemaining && vipStatus.daysRemaining > 0) {
          const remainingValue = (vipStatus.daysRemaining / 30) * (basePlans["1-month"].price / 1);
          const adjustedBasePrice = Math.max(0, plan.price - remainingValue);
          plan.price = Math.round(adjustedBasePrice / 1000) * 1000;
        }
        
        plan.discount = Math.min(50, (plan.discount || 0) + additionalDiscount);
        plan.isUpgrade = true;
        plan.features = [
          `Kéo dài thời hạn VIP thêm ${plan.months} tháng`,
          ...plan.features
        ];
      } else if (plan.months <= currentMonths) {
        plan.isActive = true;
      }
    });
    
    return adjustedPlans;
  };
  
  const plans = getAdjustedPlans();
  
  const verifyPayment = async () => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const isSuccessful = Math.random() < 0.9;
      
      if (isSuccessful) {
        setPaymentVerified(true);
        setPaymentError(null);
        
        toast.success("Thanh toán đã được xác nhận!", {
          description: "Cảm ơn bạn đã đăng ký gói VIP."
        });
        
        await recordSuccessfulPayment();
        
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
      const plan = plans[selectedPlan];
      const finalPrice = plan.discount > 0 
        ? plan.price - (plan.price * plan.discount / 100) 
        : plan.price;
      
      const isUpgrade = vipStatus.isVip;
      
      if (isUpgrade) {
        const { error: upgradeError } = await supabase
          .from('vip_purchases')
          .update({
            status: 'upgraded'
          })
          .eq('user_id', currentUser.id)
          .eq('status', 'active');
        
        if (upgradeError) throw upgradeError;
      }
      
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
      
      activateVip(plan.months, isUpgrade);
      
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
      const plan = plans[selectedPlan];
      const finalPrice = plan.discount > 0 
        ? plan.price - (plan.price * plan.discount / 100) 
        : plan.price;
      
      const isUpgrade = vipStatus.isVip;
      
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
      
      await verifyPayment();
      
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("Không thể xử lý giao dịch. Vui lòng thử lại sau.");
      setIsLoading(false);
    }
  };
  
  const activateVip = async (months, isUpgrade = false) => {
    if (!currentUser) return;
    
    try {
      let expirationDate;
      
      if (isUpgrade && vipStatus.isVip && vipStatus.daysRemaining) {
        const currentDate = new Date();
        expirationDate = new Date(currentDate);
        expirationDate.setDate(expirationDate.getDate() + vipStatus.daysRemaining);
        expirationDate.setMonth(expirationDate.getMonth() + months);
      } else {
        expirationDate = new Date();
        expirationDate.setMonth(expirationDate.getMonth() + months);
      }
      
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
      
      toast.success(isUpgrade ? "Tài khoản VIP đã được nâng cấp!" : "Tài khoản VIP đã được kích hoạt!", {
        description: `Tài khoản của bạn đã được ${isUpgrade ? 'nâng cấp' : 'kích hoạt'} và có hiệu lực đến ${expirationDate.toLocaleDateString('vi-VN')}`
      });
      
    } catch (error) {
      console.error("Lỗi khi kích hoạt VIP:", error);
    }
  };
  
  const handleSelectPlan = (plan) => {
    if (plans[plan].isActive) {
      toast.info("Bạn đã có gói VIP này hoặc gói cao hơn.");
      return;
    }
    
    setSelectedPlan(plan);
    setPaymentError(null);
  };
  
  const handleDownloadQR = () => {
    const qrImage = QR_CODE_IMAGES[selectedPlan] || QR_CODE_IMAGES["6-months"];
    
    const a = document.createElement('a');
    a.href = qrImage;
    a.download = `qr-thanh-toan-vip-${selectedPlan}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast("Đã tải xuống mã QR");
  };
  
  if (vipStatus.isVip && vipStatus.daysRemaining !== null && vipStatus.daysRemaining > 0) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Card className="border-4 border-green-500 dark:border-green-600 shadow-lg overflow-hidden">
            <div className="bg-green-500 h-3"></div>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-gray-100">
                <Crown className="h-8 w-8 text-yellow-500" />
                <span>Tài khoản VIP đang hoạt động</span>
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400 text-lg">
                Bạn đã là thành viên VIP và có thể truy cập tất cả khóa học VIP
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-8">
              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl shadow-inner">
                <div className="flex items-center gap-4 mb-3">
                  <CheckCircle className="h-6 w-6 text-green-600 shrink-0" />
                  <h3 className="font-semibold text-xl text-gray-900 dark:text-gray-100">Quyền lợi VIP của bạn</h3>
                </div>
                <div className="ml-10 space-y-2 text-gray-700 dark:text-gray-300">
                  <p>• Truy cập miễn phí tất cả các khóa học VIP</p>
                  <p>• Thời hạn còn lại: <span className="font-bold">{vipStatus.daysRemaining} ngày</span></p>
                  <p>• Gói VIP hết hạn: <span className="font-bold">{new Date(Date.now() + vipStatus.daysRemaining * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN')}</span></p>
                </div>
              </div>
              
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Bạn muốn gia hạn hoặc nâng cấp gói VIP?</h3>
                <Button onClick={() => setShowActivationPending(false)} variant="outline" size="lg" className="border-2 border-green-500 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20">
                  Xem các gói nâng cấp
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {!showActivationPending && (
            <div className="mt-12">
              <h2 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-gray-100">Nâng cấp gói VIP của bạn</h2>
              
              <Alert className="mb-8 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-500 dark:border-yellow-600">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <AlertDescription className="text-gray-700 dark:text-gray-300">
                  Bạn đã là thành viên VIP. Khi nâng cấp, thời gian còn lại của gói hiện tại ({vipStatus.daysRemaining} ngày) sẽ được cộng vào gói mới và bạn được giảm giá thêm!
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                {Object.entries(plans).map(([key, plan]) => {
                  if (!plan.isActive) {
                    return (
                      <VipPlan
                        key={key}
                        duration={plan.title}
                        months={plan.months}
                        price={plan.price}
                        discount={plan.discount}
                        features={plan.features}
                        onSelect={() => handleSelectPlan(key)}
                        isPopular={plan.isPopular}
                        isTrial={plan.isTrial}
                        isUpgrade={plan.isUpgrade}
                      />
                    );
                  }
                  return null;
                })}
              </div>
              
              {selectedPlan && !plans[selectedPlan]?.isActive && (
                <>
                  {paymentError && (
                    <Alert variant="destructive" className="mb-8 bg-red-50 dark:bg-red-900/20 border-2 border-red-500 dark:border-red-600">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      <AlertDescription className="text-gray-700 dark:text-gray-300">{paymentError}</AlertDescription>
                    </Alert>
                  )}
                  
                  <Card className="mb-12 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-gray-100">
                        <QrCode className="h-6 w-6 text-blue-500" />
                        Thanh toán qua mã QR
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400 text-lg">
                        Quét mã QR hoặc chuyển khoản đến tài khoản ngân hàng bên dưới
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <Tabs defaultValue="qr" className="w-full">
                        <TabsList className="w-full mb-6 border-b-2 border-gray-200 dark:border-gray-700">
                          <TabsTrigger value="qr" className="flex-1 text-lg font-semibold">Mã QR</TabsTrigger>
                          <TabsTrigger value="bank" className="flex-1 text-lg font-semibold">Thông tin chuyển khoản</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="qr" className="flex flex-col items-center">
                          <div className="bg-white p-6 rounded-xl shadow-md mb-6">
                            <img 
                              src={QR_CODE_IMAGES[selectedPlan]} 
                              alt="QR Code" 
                              className="w-64 h-64 object-contain" 
                            />
                            <p className="text-center text-base mt-4 text-gray-600 dark:text-gray-400">
                              Mã QR cho gói {plans[selectedPlan].title}
                            </p>
                          </div>
                          
                          <div className="flex flex-wrap justify-center gap-4">
                            <Button variant="outline" size="lg" onClick={handleDownloadQR} className="border-2 border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                              <Download className="h-5 w-5 mr-2" />
                              Tải mã QR
                            </Button>
                            <Button variant="outline" size="lg" onClick={() => {
                              const selectedPlanDetails = plans[selectedPlan];
                              const finalPrice = selectedPlanDetails.discount > 0 
                                ? selectedPlanDetails.price - (selectedPlanDetails.price * selectedPlanDetails.discount / 100) 
                                : selectedPlanDetails.price;
                              
                              navigator.clipboard.writeText(`VIB - 339435005 - NGUYEN TUAN ANH - ${finalPrice.toLocaleString('vi-VN')}đ`);
                              toast("Đã sao chép thông tin chuyển khoản");
                            }} className="border-2 border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                              <Share2 className="h-5 w-5 mr-2" />
                              Sao chép thông tin
                            </Button>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="bank">
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <p className="text-base font-semibold text-gray-900 dark:text-gray-100">Ngân hàng</p>
                                <p className="text-base bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">VIB (Vietnam International Bank)</p>
                              </div>
                              
                              <div className="space-y-2">
                                <p className="text-base font-semibold text-gray-900 dark:text-gray-100">Số tài khoản</p>
                                <p className="text-base bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">339435005</p>
                              </div>
                              
                              <div className="space-y-2">
                                <p className="text-base font-semibold text-gray-900 dark:text-gray-100">Chủ tài khoản</p>
                                <p className="text-base bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">NGUYEN TUAN ANH</p>
                              </div>
                              
                              <div className="space-y-2">
                                <p className="text-base font-semibold text-gray-900 dark:text-gray-100">Số tiền</p>
                                <p className="text-base bg-gray-100 dark:bg-gray-700 p-3 rounded-lg font-semibold">
                                  {(() => {
                                    const selectedPlanDetails = plans[selectedPlan];
                                    const finalPrice = selectedPlanDetails.discount > 0 
                                      ? selectedPlanDetails.price - (selectedPlanDetails.price * selectedPlanDetails.discount / 100) 
                                      : selectedPlanDetails.price;
                                    return `${finalPrice.toLocaleString('vi-VN')}đ`;
                                  })()}
                                </p>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <p className="text-base font-semibold text-gray-900 dark:text-gray-100">Nội dung chuyển khoản</p>
                              <p className="text-base bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                                {currentUser ? `VIP_${vipStatus.isVip ? 'UPGRADE' : 'NEW'}_${selectedPlan}_${currentUser.email.split('@')[0]}` : "VIP_[your-email]"}
                              </p>
                            </div>
                            
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-500 dark:border-yellow-600 rounded-lg p-4 text-base text-yellow-800 dark:text-yellow-200">
                              <p className="font-semibold mb-2">Lưu ý quan trọng:</p>
                              <ul className="list-disc pl-6 space-y-2">
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
                      className={`text-lg font-semibold py-6 px-8 ${
                        vipStatus.isVip 
                          ? "bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800" 
                          : "bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-800"
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <Clock className="h-5 w-5 mr-2 animate-spin" />
                          Đang xử lý...
                        </>
                      ) : (
                        vipStatus.isVip ? "Xác nhận nâng cấp VIP" : "Xác nhận đã thanh toán"
                      )}
                    </Button>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-6">
                      Bằng cách nhấn nút xác nhận, bạn đồng ý với 
                      <a href="#" className="underline ml-1">Điều khoản sử dụng</a> của chúng tôi.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
  
  if (showActivationPending) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-md">
        <VipActivationPending userEmail={currentUser?.email || ''} />
      </div>
    );
  }
  
  if (showSuccessMessage) {
    return (
      <div className="text-center py-12 space-y-6">
        <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-500" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Cảm ơn bạn!</h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Chúng tôi đã ghi nhận yêu cầu mua gói VIP của bạn.
          <br />Tài khoản của bạn sẽ được kích hoạt trong vòng 10 phút sau khi xác nhận thanh toán.
        </p>
        <Button 
          onClick={() => setShowSuccessMessage(false)} 
          variant="outline" 
          size="lg"
          className="border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Quay lại
        </Button>
      </div>
    );
  }
  
  const currentQRCode = QR_CODE_IMAGES[selectedPlan] || QR_CODE_IMAGES["6-months"];
  
  return (
    <div className="container mx-auto py-12 px-4">
      <h2 className="text-4xl font-bold mb-12 text-center text-gray-900 dark:text-gray-100 tracking-tight">
        Đăng ký gói học VIP
      </h2>
      
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {Object.entries(plans).map(([key, plan]) => 
            !plan.isActive && (
              <VipPlan
                key={key}
                duration={plan.title}
                months={plan.months}
                price={plan.price}
                discount={plan.discount}
                features={plan.features}
                onSelect={() => handleSelectPlan(key)}
                isPopular={plan.isPopular}
                isTrial={plan.isTrial}
                isUpgrade={plan.isUpgrade}
              />
            )
          )}
        </div>
      </div>
      
      {selectedPlan && (
        <div className="max-w-4xl mx-auto mt-16">
          <Card className="mb-12 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-gray-100">
                <QrCode className="h-6 w-6 text-blue-500" />
                Thanh toán qua mã QR
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400 text-lg">
                Quét mã QR hoặc chuyển khoản đến tài khoản ngân hàng bên dưới
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Tabs defaultValue="qr" className="w-full">
                <TabsList className="w-full mb-6 border-b-2 border-gray-200 dark:border-gray-700">
                  <TabsTrigger value="qr" className="flex-1 text-lg font-semibold">Mã QR</TabsTrigger>
                  <TabsTrigger value="bank" className="flex-1 text-lg font-semibold">Thông tin chuyển khoản</TabsTrigger>
                </TabsList>
                
                <TabsContent value="qr" className="flex flex-col items-center">
                  <div className="bg-white p-6 rounded-xl shadow-md mb-6">
                    <img 
                      src={QR_CODE_IMAGES[selectedPlan]} 
                      alt="QR Code" 
                      className="w-64 h-64 object-contain" 
                    />
                    <p className="text-center text-base mt-4 text-gray-600 dark:text-gray-400">
                      Mã QR cho gói {plans[selectedPlan].title}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap justify-center gap-4">
                    <Button variant="outline" size="lg" onClick={handleDownloadQR} className="border-2 border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                      <Download className="h-5 w-5 mr-2" />
                      Tải mã QR
                    </Button>
                    <Button variant="outline" size="lg" onClick={() => {
                      const selectedPlanDetails = plans[selectedPlan];
                      const finalPrice = selectedPlanDetails.discount > 0 
                        ? selectedPlanDetails.price - (selectedPlanDetails.price * selectedPlanDetails.discount / 100) 
                        : selectedPlanDetails.price;
                      
                      navigator.clipboard.writeText(`VIB - 339435005 - NGUYEN TUAN ANH - ${finalPrice.toLocaleString('vi-VN')}đ`);
                      toast("Đã sao chép thông tin chuyển khoản");
                    }} className="border-2 border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                      <Share2 className="h-5 w-5 mr-2" />
                      Sao chép thông tin
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="bank">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <p className="text-base font-semibold text-gray-900 dark:text-gray-100">Ngân hàng</p>
                        <p className="text-base bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">VIB (Vietnam International Bank)</p>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-base font-semibold text-gray-900 dark:text-gray-100">Số tài khoản</p>
                        <p className="text-base bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">339435005</p>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-base font-semibold text-gray-900 dark:text-gray-100">Chủ tài khoản</p>
                        <p className="text-base bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">NGUYEN TUAN ANH</p>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-base font-semibold text-gray-900 dark:text-gray-100">Số tiền</p>
                        <p className="text-base bg-gray-100 dark:bg-gray-700 p-3 rounded-lg font-semibold">
                          {(() => {
                            const selectedPlanDetails = plans[selectedPlan];
                            const finalPrice = selectedPlanDetails.discount > 0 
                              ? selectedPlanDetails.price - (selectedPlanDetails.price * selectedPlanDetails.discount / 100) 
                              : selectedPlanDetails.price;
                            return `${finalPrice.toLocaleString('vi-VN')}đ`;
                          })()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-base font-semibold text-gray-900 dark:text-gray-100">Nội dung chuyển khoản</p>
                      <p className="text-base bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                        {currentUser ? `VIP_${vipStatus.isVip ? 'UPGRADE' : 'NEW'}_${selectedPlan}_${currentUser.email.split('@')[0]}` : "VIP_[your-email]"}
                      </p>
                    </div>
                    
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-500 dark:border-yellow-600 rounded-lg p-4 text-base text-yellow-800 dark:text-yellow-200">
                      <p className="font-semibold mb-2">Lưu ý quan trọng:</p>
                      <ul className="list-disc pl-6 space-y-2">
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
              className="text-lg font-semibold py-6 px-8 bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-800"
            >
              {isLoading ? (
                <>
                  <Clock className="h-5 w-5 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : "Xác nhận đã thanh toán"}
            </Button>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-6">
              Bằng cách nhấn nút xác nhận, bạn đồng ý với 
              <a href="#" className="underline ml-1">Điều khoản sử dụng</a> của chúng tôi.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VipPurchaseForm;