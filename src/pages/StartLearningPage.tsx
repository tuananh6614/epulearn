
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle, Clock, FileText, Zap, Lightbulb, Users, Trophy } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCourseData } from '@/hooks/useCourseData';
import { useCourseProgress } from '@/hooks/useCourseProgress';
import { toast } from 'sonner';

const StartLearningPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { courseData, loading: courseLoading } = useCourseData(courseId);
  const { enrolled, progress, refreshProgress, enrollInCourse } = useCourseProgress({ courseId });
  
  const [activeChapter, setActiveChapter] = useState<string | null>(null);
  
  useEffect(() => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để bắt đầu học");
      navigate('/login');
    }
  }, [user, navigate]);
  
  useEffect(() => {
    if (courseData?.chapters?.length > 0) {
      setActiveChapter(courseData.chapters[0].id);
    }
  }, [courseData]);
  
  const handleStartLearning = async () => {
    if (!courseId) {
      toast.error("Không tìm thấy khóa học");
      return;
    }
    
    try {
      console.log("Starting course:", courseId);
      
      if (!enrolled) {
        // Enroll in the course first
        console.log("Not enrolled yet, enrolling now...");
        const enrollResult = await enrollInCourse();
        if (!enrollResult) {
          toast.error("Không thể đăng ký khóa học");
          return;
        }
        console.log("Enrollment successful");
      }
      
      // Find the first chapter and lesson to start with
      if (courseData?.chapters?.length > 0) {
        const firstChapter = courseData.chapters[0];
        console.log("First chapter:", firstChapter.id, firstChapter.title);
        
        if (firstChapter.lessons && firstChapter.lessons.length > 0) {
          const firstLesson = firstChapter.lessons[0];
          console.log("First lesson:", firstLesson.id, firstLesson.title);
          
          // Navigate to the lesson page
          const lessonUrl = `/course/${courseId}/chapter/${firstChapter.id}/lesson/${firstLesson.id}`;
          console.log("Navigating to:", lessonUrl);
          navigate(lessonUrl);
        } else {
          toast.error("Không tìm thấy bài học trong chương này");
        }
      } else {
        toast.error("Không tìm thấy chương học trong khóa học này");
      }
    } catch (error) {
      console.error('Error starting course:', error);
      toast.error("Không thể bắt đầu khóa học");
    }
  };
  
  const handleContinueLearning = async () => {
    if (!courseId || !enrolled) {
      toast.error("Bạn chưa đăng ký khóa học này");
      return;
    }
    
    try {
      // Find the first incomplete lesson
      let foundIncompleteLesson = false;
      
      for (const chapter of courseData?.chapters || []) {
        for (const lesson of chapter.lessons) {
          // Check if this lesson is not completed yet
          if (!lesson.completed) {
            console.log("Continuing with lesson:", lesson.id, lesson.title);
            navigate(`/course/${courseId}/chapter/${chapter.id}/lesson/${lesson.id}`);
            foundIncompleteLesson = true;
            break;
          }
        }
        if (foundIncompleteLesson) break;
      }
      
      // If all lessons are completed, start from the beginning
      if (!foundIncompleteLesson && courseData?.chapters?.length > 0) {
        const firstChapter = courseData.chapters[0];
        if (firstChapter.lessons && firstChapter.lessons.length > 0) {
          console.log("All lessons completed, starting from beginning");
          navigate(`/course/${courseId}/chapter/${firstChapter.id}/lesson/${firstChapter.lessons[0].id}`);
        } else {
          toast.error("Không tìm thấy bài học trong chương này");
        }
      }
    } catch (error) {
      console.error('Error continuing course:', error);
      toast.error("Không thể tiếp tục khóa học");
    }
  };
  
  if (courseLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  if (!courseData) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Không tìm thấy khóa học</h1>
          <p className="text-muted-foreground mb-6">Khóa học này không tồn tại hoặc đã bị xóa</p>
          <Button onClick={() => navigate('/courses')}>Xem tất cả khóa học</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/course/${courseId}`)}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại thông tin khóa học
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold">Bắt đầu học: {courseData?.title}</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Tổng quan khóa học</CardTitle>
                <CardDescription>{courseData.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-muted/50 p-4 rounded-lg flex flex-col items-center justify-center text-center">
                    <Clock className="h-6 w-6 text-primary mb-2" />
                    <div className="text-sm font-medium">Thời lượng</div>
                    <div className="text-xs text-muted-foreground">{courseData.duration}</div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg flex flex-col items-center justify-center text-center">
                    <Zap className="h-6 w-6 text-primary mb-2" />
                    <div className="text-sm font-medium">Cấp độ</div>
                    <div className="text-xs text-muted-foreground">{courseData.level}</div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg flex flex-col items-center justify-center text-center">
                    <BookOpen className="h-6 w-6 text-primary mb-2" />
                    <div className="text-sm font-medium">Chương</div>
                    <div className="text-xs text-muted-foreground">{courseData.chapters?.length || 0} chương học</div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg flex flex-col items-center justify-center text-center">
                    <FileText className="h-6 w-6 text-primary mb-2" />
                    <div className="text-sm font-medium">Bài học</div>
                    <div className="text-xs text-muted-foreground">
                      {courseData.chapters?.reduce((sum, chapter) => sum + chapter.lessons.length, 0) || 0} bài
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3">Bạn sẽ học được</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4">
                    {(courseData.objectives || []).map((objective, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Alert>
                  <Lightbulb className="h-4 w-4 text-primary" />
                  <AlertDescription>
                    Khóa học này được thiết kế để giúp bạn học theo tốc độ của riêng mình. Bạn có thể tạm dừng và tiếp tục bất cứ lúc nào.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
            
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Nội dung khóa học</h2>
              
              {courseData?.chapters?.map((chapter, chapterIndex) => (
                <Card key={chapter.id} className="overflow-hidden">
                  <CardHeader 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setActiveChapter(activeChapter === chapter.id ? null : chapter.id)}
                  >
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Chương {chapterIndex + 1}: {chapter.title}</CardTitle>
                      <div className="text-sm text-muted-foreground">
                        {chapter.lessons?.length || 0} bài học
                      </div>
                    </div>
                  </CardHeader>
                  
                  {activeChapter === chapter.id && (
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        {chapter.lessons?.map((lesson, lessonIndex) => (
                          <div 
                            key={lesson.id}
                            className="flex items-center justify-between p-3 rounded-md hover:bg-muted/50"
                          >
                            <div className="flex items-center">
                              {lesson.type === 'video' ? (
                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 flex items-center justify-center mr-3">
                                  <span className="text-xs font-medium">{lessonIndex + 1}</span>
                                </div>
                              ) : lesson.type === 'test' ? (
                                <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 flex items-center justify-center mr-3">
                                  <span className="text-xs font-medium">KT</span>
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300 flex items-center justify-center mr-3">
                                  <span className="text-xs font-medium">{lessonIndex + 1}</span>
                                </div>
                              )}
                              
                              <div>
                                <div className="font-medium text-sm">{lesson.title}</div>
                                <div className="text-xs text-muted-foreground">
                                  {lesson.type === 'video' ? 'Video' : lesson.type === 'test' ? 'Bài kiểm tra' : 'Bài học'} • {lesson.duration}
                                </div>
                              </div>
                            </div>
                            
                            {enrolled ? (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/course/${courseId}/chapter/${chapter.id}/lesson/${lesson.id}`);
                                }}
                              >
                                {lesson.type === 'test' ? 'Làm bài' : 'Xem'}
                              </Button>
                            ) : (
                              <div className="text-xs text-muted-foreground">Chưa ghi danh</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card>
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={courseData?.thumbnail_url || '/placeholder.svg'} 
                    alt={courseData?.title} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-lg font-bold mb-1">{courseData?.title}</h3>
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 mr-1" />
                      <span>Giảng viên: {courseData?.instructor}</span>
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  {enrolled ? (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Tiến độ của bạn</span>
                        <span className="text-sm font-medium">{progress}%</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-6">
                      <Alert>
                        <AlertDescription>
                          Bạn chưa đăng ký khóa học này. Hãy đăng ký để bắt đầu học!
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                  
                  {enrolled ? (
                    <Button 
                      className="w-full mb-3"
                      onClick={progress > 0 ? handleContinueLearning : handleStartLearning}
                    >
                      {progress > 0 ? 'Tiếp tục học' : 'Bắt đầu học'}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button 
                      className="w-full mb-3"
                      onClick={handleStartLearning}
                    >
                      Đăng ký và bắt đầu học
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                  
                  {enrolled && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate(`/course/${courseId}/test`)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Bài kiểm tra tổng quát
                    </Button>
                  )}
                  
                  <Separator className="my-6" />
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Bao gồm trong khóa học:</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>Truy cập trọn đời</span>
                      </li>
                      <li className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>Bài giảng chất lượng cao</span>
                      </li>
                      <li className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>Bài kiểm tra, đánh giá</span>
                      </li>
                      <li className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>Chứng chỉ hoàn thành</span>
                      </li>
                      <li className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>Học mọi lúc, mọi nơi</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default StartLearningPage;
