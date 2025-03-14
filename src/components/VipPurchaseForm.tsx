
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

// QR codes for different plans - now with unique QR code for each plan
const QR_CODE_IMAGES = {
  "1-month": "/lovable-uploads/716a4a4d-2cfb-496e-8984-404260ce774e.png",
  "3-months": "/lovable-uploads/7c546418-cf60-465d-86f4-90c78bb79179.png",
  "6-months": "/lovable-uploads/716a4a4d-2cfb-496e-8984-404260ce774e.png",
  "1-year": "/lovable-uploads/7c546418-cf60-465d-86f4-90c78bb79179.png"
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
    <Card className={`relative h-full ${
      isPopular ? 'border-2 border-yellow-500 dark:border-yellow-600' : 
      isUpgrade ? 'border-2 border-green-500 dark:border-green-600' : 'border'}`}>
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
      {isUpgrade && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
          <ArrowUpRight className="h-3 w-3" />
          Nâng cấp
        </div>
      )}
      
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className={`h-5 w-5 ${
            isPopular ? 'text-yellow-500' : 
            isUpgrade ? 'text-green-500' : 
            isTrial ? 'text-blue-500' : 'text-blue-500'}`} />
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
          className={`w-full ${
            isPopular ? 'bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-800' : 
            isUpgrade ? 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800' : ''}`}
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
  
  // Load user's VIP status when component mounts
  useEffect(() => {
    const loadVipStatus = async () => {
      if (currentUser?.id) {
        const status = await checkVipAccess(currentUser.id);
        setVipStatus(status);
        
        // Get the current VIP plan if the user is a VIP
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
  
  // Base plans - these will be adjusted based on user's VIP status
  const basePlans = {
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
  
  // Calculate adjusted plans based on current VIP status
  const getAdjustedPlans = () => {
    if (!vipStatus.isVip) {
      return basePlans;
    }
    
    const adjustedPlans = {...basePlans};
    
    // Determine which plan the user currently has based on currentVipPlan
    const currentMonths = 
      currentVipPlan === "vip1" || currentVipPlan === "1-month" ? 1 :
      currentVipPlan === "vip3" || currentVipPlan === "3-months" ? 3 :
      currentVipPlan === "vip6" || currentVipPlan === "6-months" ? 6 :
      currentVipPlan === "vip1year" || currentVipPlan === "1-year" ? 12 : 0;
    
    // Apply discounts for upgrades
    Object.keys(adjustedPlans).forEach(planKey => {
      const plan = adjustedPlans[planKey as keyof typeof adjustedPlans];
      
      // Only create upgrade options for plans longer than the current one
      if (plan.months > currentMonths) {
        // For upgrade, we apply an additional 5-15% discount
        const additionalDiscount = 
          plan.months <= 3 ? 5 : 
          plan.months <= 6 ? 10 : 15;
        
        // Calculate prorated price based on remaining days
        if (vipStatus.daysRemaining && vipStatus.daysRemaining > 0) {
          const remainingValue = (vipStatus.daysRemaining / 30) * (basePlans["1-month"].price / 1);
          const adjustedBasePrice = Math.max(0, plan.price - remainingValue);
          plan.price = Math.round(adjustedBasePrice / 1000) * 1000; // Round to nearest 1000
        }
        
        plan.discount = Math.min(50, (plan.discount || 0) + additionalDiscount); // Cap at 50% max discount
        plan.isUpgrade = true;
        // Add upgrade-specific feature
        plan.features = [
          `Kéo dài thời hạn VIP thêm ${plan.months} tháng`,
          ...plan.features
        ];
      } else if (plan.months <= currentMonths) {
        // For plans shorter or equal to current, mark as already active
        plan.isActive = true;
      }
    });
    
    return adjustedPlans;
  };
  
  const plans = getAdjustedPlans();
  
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
      
      // Determine if this is a new VIP subscription or an upgrade
      const isUpgrade = vipStatus.isVip;
      
      // If it's an upgrade, update the existing VIP entry to 'upgraded'
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
      const plan = plans[selectedPlan as keyof typeof plans];
      const finalPrice = plan.discount > 0 
        ? plan.price - (plan.price * plan.discount / 100) 
        : plan.price;
      
      // Determine if this is an upgrade
      const isUpgrade = vipStatus.isVip;
      
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
  
  const activateVip = async (months: number, isUpgrade: boolean = false) => {
    if (!currentUser) return;
    
    try {
      let expirationDate: Date;
      
      if (isUpgrade && vipStatus.isVip && vipStatus.daysRemaining) {
        // If upgrading, add the new months to the current expiration date
        const currentDate = new Date();
        expirationDate = new Date(currentDate);
        expirationDate.setDate(expirationDate.getDate() + vipStatus.daysRemaining);
        expirationDate.setMonth(expirationDate.getMonth() + months);
      } else {
        // New subscription
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
  
  const handleSelectPlan = (plan: string) => {
    // Don't allow selecting a plan that's shorter or equal to current one if user is already VIP
    const selectedPlanObj = plans[plan as keyof typeof plans];
    if (selectedPlanObj.isActive) {
      toast.info("Bạn đã có gói VIP này hoặc gói cao hơn.");
      return;
    }
    
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
  
  // If the user is VIP, show a message about auto-access to VIP courses
  if (vipStatus.isVip && vipStatus.daysRemaining !== null && vipStatus.daysRemaining > 0) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-3xl mx-auto">
          <Card className="border-2 border-green-500 overflow-hidden">
            <div className="bg-green-500 h-2"></div>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-6 w-6 text-yellow-500" />
                <span>Tài khoản VIP đang hoạt động</span>
              </CardTitle>
              <CardDescription>
                Bạn đã là thành viên VIP và có thể truy cập tất cả khóa học VIP
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                  <h3 className="font-medium text-lg">Quyền lợi VIP của bạn</h3>
                </div>
                <div className="ml-8 space-y-1">
                  <p>• Truy cập miễn phí tất cả các khóa học VIP</p>
                  <p>• Thời hạn còn lại: <span className="font-bold">{vipStatus.daysRemaining} ngày</span></p>
                  <p>• Gói VIP hết hạn: <span className="font-bold">{new Date(Date.now() + vipStatus.daysRemaining * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN')}</span></p>
                </div>
              </div>
              
              <div className="text-center">
                <h3 className="text-lg font-medium mb-3">Bạn muốn gia hạn hoặc nâng cấp gói VIP?</h3>
                <Button onClick={() => setShowActivationPending(false)} variant="outline" size="lg">
                  Xem các gói nâng cấp
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {!showActivationPending && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-6 text-center">Nâng cấp gói VIP của bạn</h2>
              
              <Alert className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Bạn đã là thành viên VIP. Khi nâng cấp, thời gian còn lại của gói hiện tại ({vipStatus.daysRemaining} ngày) sẽ được cộng vào gói mới và bạn được giảm giá thêm!
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {Object.entries(plans).map(([key, plan]) => {
                  // Only show plans that are upgrades from the current plan
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
              
              {/* Payment section - same as before */}
              {selectedPlan && !plans[selectedPlan as keyof typeof plans]?.isActive && (
                <>
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
                            <img 
                              src={QR_CODE_IMAGES[selectedPlan as keyof typeof QR_CODE_IMAGES] || QR_CODE_IMAGES["6-months"]} 
                              alt="QR Code" 
                              className="w-56 h-56 object-contain" 
                            />
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
                                {currentUser ? `VIP_${vipStatus.isVip ? 'UPGRADE' : 'NEW'}_${selectedPlan}_${currentUser.email.split('@')[0]}` : "VIP_[your-email]"}
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
                      className={`${
                        vipStatus.isVip 
                          ? "bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800" 
                          : "bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-800"
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Đang xử lý...
                        </>
                      ) : (
                        vipStatus.isVip ? "Xác nhận nâng cấp VIP" : "Xác nhận đã thanh toán"
                      )}
                    </Button>
                    
                    <p className="text-xs text-muted-foreground mt-4">
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
