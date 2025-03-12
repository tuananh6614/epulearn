import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CourseCard from '@/components/CourseCard';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { fetchCourses } from '@/services/apiUtils';
import { SupabaseCourseResponse } from '@/models/lesson';
import { Crown, AlertTriangle, Lock, FileText, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VipPurchaseForm from '@/components/VipPurchaseForm';
import { useAuth } from '@/context/AuthContext';

const VipCourses = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("courses");
  const [expandedChapter, setExpandedChapter] = useState<number | null>(1);
  
  const { data: coursesData, isLoading, error } = useQuery({
    queryKey: ['vipCourses'],
    queryFn: async () => {
      const courses = await fetchCourses();
      return courses.filter((course) => course.is_premium);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((_, index) => (
                <div key={index} className="bg-gray-200 dark:bg-gray-700 animate-pulse h-80 rounded-lg"></div>
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
              <p className="text-gray-500 dark:text-gray-400">
                Vui lòng thử lại sau
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
        { id: "l3", title: "Cơ bản về HTML", duration: "20 phút", isLocked: true },
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
  
  const toggleChapter = (chapterId: number) => {
    if (expandedChapter === chapterId) {
      setExpandedChapter(null);
    } else {
      setExpandedChapter(chapterId);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-6">
            <Crown className="h-8 w-8 text-yellow-500" />
            <h1 className="text-3xl font-bold">Khóa Học VIP</h1>
          </div>

          <Alert variant="warning" className="mb-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Bạn cần đăng ký gói VIP để truy cập toàn bộ nội dung khóa học cao cấp
            </AlertDescription>
          </Alert>
          
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
                          isPremium={true}
                          price={course.price || undefined}
                          discountPrice={course.discount_price || undefined}
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
                                          {lesson.isLocked ? (
                                            <Lock className="h-4 w-4 text-amber-500" />
                                          ) : (
                                            <BookOpen className="h-4 w-4 text-blue-500" />
                                          )}
                                          <span className={lesson.isLocked ? "text-muted-foreground" : ""}>
                                            {lesson.title}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                                          {lesson.isLocked && (
                                            <Badge variant="outline" className="text-xs bg-amber-100 dark:bg-amber-950 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300">
                                              VIP
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
                        
                        <Card className="bg-white dark:bg-gray-700/50 border-2 border-yellow-200 dark:border-yellow-800">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-center mb-4">
                              <h4 className="font-medium">Câu hỏi mẫu:</h4>
                              <Badge className="bg-yellow-500">Chỉ dành cho VIP</Badge>
                            </div>
                            <p className="font-medium mb-4">Đâu là thẻ HTML dùng để tạo tiêu đề lớn nhất?</p>
                            <div className="space-y-2 opacity-50">
                              <div className="flex items-center gap-2 p-2 rounded bg-gray-100 dark:bg-gray-600">
                                <div className="w-4 h-4 border border-gray-300 dark:border-gray-500 rounded"></div>
                                <span>&lt;h1&gt;</span>
                              </div>
                              <div className="flex items-center gap-2 p-2 rounded bg-gray-100 dark:bg-gray-600">
                                <div className="w-4 h-4 border border-gray-300 dark:border-gray-500 rounded"></div>
                                <span>&lt;header&gt;</span>
                              </div>
                              <div className="flex items-center gap-2 p-2 rounded bg-gray-100 dark:bg-gray-600">
                                <div className="w-4 h-4 border border-gray-300 dark:border-gray-500 rounded"></div>
                                <span>&lt;heading&gt;</span>
                              </div>
                              <div className="flex items-center gap-2 p-2 rounded bg-gray-100 dark:bg-gray-600">
                                <div className="w-4 h-4 border border-gray-300 dark:border-gray-500 rounded"></div>
                                <span>&lt;h6&gt;</span>
                              </div>
                            </div>
                            <div className="flex justify-center mt-6">
                              <Lock className="h-8 w-8 text-yellow-500" />
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                  
                  <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm p-6 sticky top-24">
                      <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                        <Crown className="h-5 w-5 text-yellow-500" />
                        Đăng ký Gói VIP
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Truy cập toàn bộ khóa học VIP và mở khóa các tính năng cao cấp
                      </p>
                      
                      <div className="space-y-4 mb-6">
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
                      
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg font-bold">Giá:</span>
                          <div>
                            <span className="text-xl font-bold text-yellow-600 dark:text-yellow-500">500.000đ</span>
                            <span className="text-sm text-muted-foreground ml-2">(3 tháng)</span>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground text-right">
                          Tiết kiệm 10% khi đăng ký gói năm
                        </div>
                      </div>
                      
                      <Separator className="my-6" />
                      
                      <Button 
                        className="w-full bg-yellow-600 hover:bg-yellow-700 mb-3" 
                        size="lg"
                        onClick={() => setActiveTab("purchase")}
                      >
                        Đăng ký ngay
                      </Button>
                      
                      <p className="text-xs text-center text-muted-foreground">
                        Bảo đảm hoàn tiền trong 30 ngày nếu không hài lòng
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20">
                  <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Chưa có khóa học VIP nào
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Vui lòng quay lại sau
                  </p>
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
