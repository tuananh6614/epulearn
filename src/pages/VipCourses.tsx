import React, { useState, useEffect } from 'react'; // Explicitly import React
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CourseCard from '@/components/CourseCard';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { fetchVipCourses } from '@/services/apiUtils';
import { SupabaseCourseResponse } from '@/models/lesson';
import { Crown, AlertTriangle, Lock, FileText, BookOpen, ChevronDown, ChevronUp, CheckCircle, ArrowRight } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VipPurchaseForm from '@/components/VipPurchaseForm';
import { useAuth } from '@/context/AuthContext';
import { checkVipAccess, VipStatus } from '@/integrations/supabase/client';
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from 'sonner';

const VipCourses = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("courses");
  const [expandedChapter, setExpandedChapter] = useState<number | null>(1);
  const [vipStatus, setVipStatus] = useState<VipStatus>({ isVip: false, daysRemaining: null });
  
  const { data: coursesData, isLoading, error, refetch } = useQuery({
    queryKey: ['vipCourses'],
    queryFn: async () => {
      try {
        console.log('Fetching VIP courses...');
        const courses = await fetchVipCourses();
        console.log('VIP courses fetched:', courses.length);
        return courses;
      } catch (error) {
        console.error('Error fetching VIP courses:', error);
        toast.error('Không thể tải danh sách khóa học VIP. Vui lòng thử lại sau.');
        return [];
      }
    },
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });
  
  useEffect(() => {
    const checkUserVipStatus = async () => {
      if (currentUser?.id) {
        try {
          const status = await checkVipAccess(currentUser.id);
          setVipStatus(status);
        } catch (error) {
          console.error('Error checking VIP status:', error);
          toast.error('Không thể kiểm tra trạng thái VIP');
        }
      }
    };
    
    checkUserVipStatus();
  }, [currentUser]);
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab === 'purchase') {
      setActiveTab('purchase');
    }
  }, []);
  
  const toggleChapter = (chapterId: number) => {
    if (expandedChapter === chapterId) {
      setExpandedChapter(null);
    } else {
      setExpandedChapter(chapterId);
    }
  };

  const sampleChapters = [
    {
      id: 1,
      title: "Giới thiệu khóa học",
      lessons: [
        { id: "l1", title: "Tổng quan về khóa học", duration: "10 phút", isLocked: false },
        { id: "l2", title: "Các công cụ cần thiết", duration: "15 phút", isLocked: true },
      ]
    },
    {
      id: 2,
      title: "Kiến thức nền tảng",
      lessons: [
        { id: "l3", title: "Cơ cơ bản về HTML", duration: "20 phút", isLocked: true },
        { id: "l4", title: "Cơ bản về CSS", duration: "25 phút", isLocked: true },
        { id: "l5", title: "Bài kiểm tra kiến thức", duration: "15 phút", isLocked: true },
      ]
    },
    {
      id: 3,
      title: "Nâng cao",
      lessons: [
        { id: "l6", title: "Responsive Design", duration: "30 phút", isLocked: true },
        { id: "l7", title: "Dự án thực hành", duration: "60 phút", isLocked: true },
      ]
    }
  ];

  const vipPackages = [
    {
      id: 1,
      title: "Đăng ký Tháng",
      price: 99000,
      duration: "1 tháng",
      discount: null,
      features: ["Truy cập khóa học VIP", "Hỗ trợ qua email"],
    },
    {
      id: 2,
      title: "Đăng ký 3 Tháng",
      price: 500000,
      duration: "3 tháng",
      discount: "Tiết kiệm 10%",
      features: ["Truy cập khóa học VIP", "Hỗ trợ qua email", "Bài kiểm tra", "Chứng chỉ"],
    },
    {
      id: 3,
      title: "Đăng ký 1 Năm",
      price: 1600000,
      duration: "12 tháng",
      discount: "Tiết kiệm 20%",
      features: ["Truy cập khóa học VIP", "Hỗ trợ trực tiếp", "Bài kiểm tra", "Chứng chỉ", "Học cùng giảng viên"],
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-6">
              <Crown className="h-8 w-8 text-yellow-500" />
              <h1 className="text-3xl font-bold">Khóa Học VIP</h1>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((_, index) => (
                <Skeleton key={index} className="h-80 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="text-center py-20">
              <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
                Không thể tải danh sách khóa học VIP
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Vui lòng thử lại sau
              </p>
              <Button onClick={() => refetch()}>
                Thử lại
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-6">
            <Crown className="h-8 w-8 text-yellow-500" />
            <h1 className="text-3xl font-bold">Khóa Học VIP</h1>
          </div>

          {vipStatus.isVip ? (
            <Alert className="mb-8 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertTitle>Bạn đã là thành viên VIP!</AlertTitle>
              <AlertDescription className="mt-1">
                Bạn có thể truy cập tất cả khóa học VIP miễn phí. Thời hạn VIP còn {vipStatus.daysRemaining} ngày.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="warning" className="mb-8">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Bạn cần đăng ký gói VIP để truy cập toàn bộ nội dung khóa học cao cấp
              </AlertDescription>
            </Alert>
          )}
          
          <Tabs defaultValue="courses" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full max-w-md mx-auto mb-8">
              <TabsTrigger value="courses" className="flex-1">Khóa học VIP</TabsTrigger>
              <TabsTrigger value="purchase" className="flex-1">Đăng ký gói VIP</TabsTrigger>
            </TabsList>
            
            <TabsContent value="courses">
              {coursesData && coursesData.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {coursesData.map((course: SupabaseCourseResponse) => (
                        <CourseCard
                          key={course.id}
                          id={course.id}
                          title={course.title}
                          description={course.description}
                          level={course.level}
                          duration={course.duration}
                          category={course.category}
                          image={course.thumbnail_url || '/placeholder.svg'}
                          color="#ffd700"
                          isPremium={!vipStatus.isVip}
                          price={vipStatus.isVip ? undefined : course.price || undefined}
                          discountPrice={vipStatus.isVip ? undefined : course.discount_price || undefined}
                          vipUnlocked={vipStatus.isVip}
                        />
                      ))}
                    </div>
                    
                    <div className="mt-12">
                      <h2 className="text-2xl font-bold mb-6">Xem trước nội dung khóa học</h2>
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
                        <h3 className="text-xl font-medium mb-4">Mục lục khóa học</h3>
                        <div className="space-y-4">
                          {sampleChapters.map((chapter) => (
                            <Card key={chapter.id} className="border shadow-sm">
                              <div 
                                className="p-4 font-medium flex justify-between items-center cursor-pointer"
                                onClick={() => toggleChapter(chapter.id)}
                              >
                                <h4 className="text-lg">Chương {chapter.id}: {chapter.title}</h4>
                                {expandedChapter === chapter.id ? (
                                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                              
                              {expandedChapter === chapter.id && (
                                <CardContent className="pt-0 pb-4">
                                  <div className="space-y-2">
                                    {chapter.lessons.map((lesson) => (
                                      <div 
                                        key={lesson.id} 
                                        className="flex items-center justify-between py-2 px-3 rounded-md bg-white dark:bg-gray-700/50"
                                      >
                                        <div className="flex items-center gap-2">
                                          {lesson.isLocked && !vipStatus.isVip ? (
                                            <Lock className="h-4 w-4 text-amber-500" />
                                          ) : (
                                            <BookOpen className="h-4 w-4 text-blue-500" />
                                          )}
                                          <span className={lesson.isLocked && !vipStatus.isVip ? "text-muted-foreground" : ""}>
                                            {lesson.title}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                                          {lesson.isLocked && !vipStatus.isVip && (
                                            <Badge variant="outline" className="text-xs bg-amber-100 dark:bg-amber-950 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300">
                                              VIP
                                            </Badge>
                                          )}
                                          {lesson.isLocked && vipStatus.isVip && (
                                            <Badge variant="outline" className="text-xs bg-green-100 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300">
                                              Đã mở khóa
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </CardContent>
                              )}
                            </Card>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-12">
                      <h2 className="text-2xl font-bold mb-6">Bài kiểm tra kiến thức</h2>
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <FileText className="h-5 w-5 text-blue-500" />
                          <h3 className="text-xl font-medium">Mỗi chương học đều có bài kiểm tra</h3>
                        </div>
                        <p className="text-muted-foreground mb-6">
                          Kiểm tra kiến thức của bạn sau mỗi chương học với các bài kiểm tra trắc nghiệm. 
                          Bài kiểm tra giúp củng cố kiến thức và đánh giá mức độ hiểu bài.
                        </p>
                        
                        <Card className={`border-2 ${vipStatus.isVip ? 'border-green-200 dark:border-green-800 bg-white dark:bg-gray-700/50' : 'border-yellow-200 dark:border-yellow-800 bg-white dark:bg-gray-700/50'}`}>
                          <CardContent className="p-6">
                            <div className="flex justify-between items-center mb-4">
                              <h4 className="font-medium">Câu hỏi mẫu:</h4>
                              {vipStatus.isVip ? (
                                <Badge className="bg-green-500">Đã mở khóa</Badge>
                              ) : (
                                <Badge className="bg-yellow-500">Chỉ dành cho VIP</Badge>
                              )}
                            </div>
                            <p className="font-medium mb-4">Đâu là thẻ HTML dùng để tạo tiêu đề lớn nhất?</p>
                            <div className={`space-y-2 ${vipStatus.isVip ? '' : 'opacity-50'}`}>
                              <div className="flex items-center gap-2 p-2 rounded bg-gray-100 dark:bg-gray-600">
                                <div className="w-4 h-4 border border-gray-300 dark:border-gray-500 rounded"></div>
                                <span>{"<h1>"}</span>
                              </div>
                              <div className="flex items-center gap-2 p-2 rounded bg-gray-100 dark:bg-gray-600">
                                <div className="w-4 h-4 border border-gray-300 dark:border-gray-500 rounded"></div>
                                <span>{"<header>"}</span>
                              </div>
                              <div className="flex items-center gap-2 p-2 rounded bg-gray-100 dark:bg-gray-600">
                                <div className="w-4 h-4 border border-gray-300 dark:border-gray-500 rounded"></div>
                                <span>{"<heading>"}</span>
                              </div>
                              <div className="flex items-center gap-2 p-2 rounded bg-gray-100 dark:bg-gray-600">
                                <div className="w-4 h-4 border border-gray-300 dark:border-gray-500 rounded"></div>
                                <span>{"<h6>"}</span>
                              </div>
                            </div>
                            {!vipStatus.isVip && (
                              <div className="flex justify-center mt-6">
                                <Lock className="h-8 w-8 text-yellow-500" />
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                  
                  <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-md p-6 sticky top-24">
                      {vipStatus.isVip ? (
                        <>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-full">
                              <Crown className="h-6 w-6 text-yellow-600 dark:text-yellow-500" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold">Tài khoản VIP</h3>
                              <p className="text-sm text-muted-foreground">
                                Còn {vipStatus.daysRemaining} ngày sử dụng
                              </p>
                            </div>
                          </div>
                          
                          <Alert className="mb-4 bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription>
                              Bạn có thể truy cập tất cả khóa học VIP miễn phí
                            </AlertDescription>
                          </Alert>
                          
                          <div className="space-y-3 mb-6">
                            <div className="flex items-start gap-2">
                              <div className="text-green-500 mt-0.5">✓</div>
                              <div>Truy cập toàn bộ khóa học VIP</div>
                            </div>
                            <div className="flex items-start gap-2">
                              <div className="text-green-500 mt-0.5">✓</div>
                              <div>Bài kiểm tra và đánh giá chuyên sâu</div>
                            </div>
                            <div className="flex items-start gap-2">
                              <div className="text-green-500 mt-0.5">✓</div>
                              <div>Hỗ trợ trực tiếp từ giảng viên</div>
                            </div>
                            <div className="flex items-start gap-2">
                              <div className="text-green-500 mt-0.5">✓</div>
                              <div>Chứng chỉ hoàn thành khóa học</div>
                            </div>
                          </div>
                          
                          <Separator className="my-4" />
                          
                          <Button 
                            className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 mb-2"
                            onClick={() => setActiveTab("purchase")}
                          >
                            <ArrowRight className="h-4 w-4 mr-2" />
                            Nâng cấp gói VIP
                          </Button>
                          <p className="text-xs text-center text-muted-foreground">
                            Nâng cấp để mở rộng thời hạn và nhận thêm đặc quyền
                          </p>
                        </>
                      ) : (
                        <>
                          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Crown className="h-5 w-5 text-yellow-500" />
                            Đăng ký Gói VIP
                          </h3>
                          
                          <div className="space-y-6">
                            {vipPackages.map((pkg) => (
                              <Card
                                key={pkg.id}
                                className="border-2 border-yellow-300 bg-yellow-50 dark:bg-yellow-900/30 hover:shadow-lg transition-shadow duration-300 rounded-lg p-4"
                              >
                                <CardContent className="p-0">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                      {pkg.title}
                                    </h4>
                                    <Crown className="h-5 w-5 text-yellow-600" />
                                  </div>
                                  <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-300 mb-2">
                                    {pkg.price.toLocaleString('vi-VN')}đ
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    {pkg.duration}
                                  </p>
                                  {pkg.discount && (
                                    <Badge className="bg-green-500 text-white mb-4">
                                      {pkg.discount}
                                    </Badge>
                                  )}
                                  <ul className="space-y-2 mb-4">
                                    {pkg.features.map((feature, index) => (
                                      <li key={index} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <span>{feature}</span>
                                      </li>
                                    ))}
                                  </ul>
                                  <Button
                                    className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white"
                                    onClick={() => setActiveTab("purchase")}
                                  >
                                    Chọn gói
                                  </Button>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                          
                          <p className="text-xs text-center text-muted-foreground mt-6">
                            Bảo đảm hoàn tiền trong 30 ngày nếu không hài lòng
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20">
                  <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {!coursesData || coursesData.length === 0 ? 
                      "Không tìm thấy khóa học VIP nào. Vui lòng thử lại sau." : 
                      "Đang tải khóa học VIP..."}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    {!coursesData || coursesData.length === 0 ? 
                      "Có thể chưa có khóa học VIP nào được thêm vào hệ thống." : 
                      "Vui lòng đợi trong giây lát..."}
                  </p>
                  <Button onClick={() => refetch()}>
                    Tải lại danh sách
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="purchase">
              <VipPurchaseForm />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VipCourses;