import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Clock, FileText, Info, Loader2, Lock, Zap, BookOpen, Video, AlertCircle, Crown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from "@/components/ui/use-toast";
import { fetchCourseContent, supabase, checkVipAccess, VipStatus } from '@/integrations/supabase/client';
import { enrollUserInCourse } from '@/integrations/supabase/apiUtils';
import { toast } from 'sonner';

interface DisplayLesson {
  id: string;
  title: string;
  type: "lesson" | "test" | "video";
  duration: string;
  completed: boolean;
  questions?: number;
}

interface DisplayChapter {
  id: string;
  title: string;
  description: string;
  lessons: DisplayLesson[];
}

interface DisplayCourse {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  level: string;
  duration: string;
  totalLessons: number;
  totalTests: number;
  image: string;
  color: string;
  requirements: string[];
  objectives: string[];
  chapters: DisplayChapter[];
}

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast: uiToast } = useToast();
  
  const [course, setCourse] = useState<DisplayCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [enrolling, setEnrolling] = useState(false);
  const [isVipRequired, setIsVipRequired] = useState(false);
  const [vipStatus, setVipStatus] = useState<VipStatus>({ isVip: false, daysRemaining: null });
  const [showVipModal, setShowVipModal] = useState(false);
  
  useEffect(() => {
    const loadCourse = async () => {
      if (!courseId) return;
      
      try {
        setLoading(true);
        console.log(`Loading course details for ID: ${courseId}`);
        
        const courseData = await fetchCourseContent(courseId);
        console.log('Fetched course data:', courseData);
        
        if (!courseData) {
          console.error('No course data returned');
          toast.error("Không thể tải thông tin khóa học");
          setLoading(false);
          return;
        }
        
        // Check if course is premium and requires VIP
        setIsVipRequired(courseData.is_premium);
        
        if (user) {
          // Check enrollment
          const { data: enrollment, error } = await supabase
            .from('user_courses')
            .select('*')
            .eq('user_id', user.id)
            .eq('course_id', courseId)
            .maybeSingle();
            
          if (error) {
            console.error('Error checking enrollment:', error);
          } else {
            setEnrolled(!!enrollment);
            setProgress(enrollment?.progress_percentage || 0);
          }
          
          // Check VIP status with the new function that returns an object
          const vipStatusResult = await checkVipAccess(user.id);
          setVipStatus(vipStatusResult);
        }
        
        const displayCourse: DisplayCourse = {
          id: courseData.id,
          title: courseData.title,
          description: courseData.description,
          fullDescription: courseData.full_description || '',
          level: courseData.level,
          duration: courseData.duration,
          totalLessons: courseData.chapters.reduce(
            (total, chapter) => total + chapter.lessons.filter(l => l.type !== 'test').length, 
            0
          ),
          totalTests: courseData.chapters.reduce(
            (total, chapter) => total + chapter.lessons.filter(l => l.type === 'test').length, 
            0
          ),
          image: courseData.thumbnail_url || '/placeholder.svg',
          color: getRandomColor(courseData.id),
          requirements: courseData.requirements || [],
          objectives: courseData.objectives || [],
          chapters: courseData.chapters.map(chapter => ({
            id: chapter.id,
            title: chapter.title,
            description: chapter.description || '',
            lessons: chapter.lessons.map(lesson => ({
              id: lesson.id,
              title: lesson.title,
              type: lesson.type as "lesson" | "test" | "video",
              duration: lesson.duration,
              completed: false,
              questions: lesson.type === 'test' ? 10 : undefined
            }))
          }))
        };
        
        setCourse(displayCourse as DisplayCourse);
        setLoading(false);
      } catch (error) {
        console.error('Error loading course:', error);
        toast.error("Đã xảy ra lỗi khi tải dữ liệu khóa học");
        setLoading(false);
      }
    };
    
    loadCourse();
  }, [courseId, user, uiToast]);
  
  const handleEnroll = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để đăng ký khóa học");
      navigate('/login');
      return;
    }
    
    if (!courseId) return;
    
    // Check if course requires VIP
    if (isVipRequired && !vipStatus.isVip) {
      toast.error("Bạn cần đăng ký gói VIP để truy cập khóa học này");
      setShowVipModal(true);
      return;
    }
    
    try {
      setEnrolling(true);
      console.log("Starting course enrollment process");
      
      const { success, error } = await enrollUserInCourse(user.id, courseId);
      
      if (success) {
        setEnrolled(true);
        setProgress(0);
        toast.success("Đăng ký khóa học thành công");
      } else {
        console.error('Error enrolling in course:', error);
        toast.error("Không thể đăng ký khóa học: " + (error?.message || "Lỗi không xác định"));
      }
      
      setEnrolling(false);
    } catch (error) {
      console.error('Error enrolling in course:', error);
      toast.error("Không thể đăng ký khóa học");
      setEnrolling(false);
    }
  };
  
  const startCourse = () => {
    if (!course || !course.chapters[0]?.lessons[0]) return;
    
    navigate(`/course/${courseId}/chapter/${course.chapters[0].id}/lesson/${course.chapters[0].lessons[0].id}`);
  };
  
  const continueCourse = () => {
    if (!course) return;
    
    let foundNextLesson = false;
    
    for (const chapter of course.chapters) {
      for (const lesson of chapter.lessons) {
        if (!lesson.completed) {
          navigate(`/course/${courseId}/chapter/${chapter.id}/lesson/${lesson.id}`);
          foundNextLesson = true;
          break;
        }
      }
      if (foundNextLesson) break;
    }
    
    if (!foundNextLesson && course.chapters[0]?.lessons[0]) {
      navigate(`/course/${courseId}/chapter/${course.chapters[0].id}/lesson/${course.chapters[0].lessons[0].id}`);
    }
  };
  
  const getRandomColor = (id: string) => {
    const colors = ['#3498db', '#e74c3c', '#2ecc71', '#9b59b6', '#f39c12', '#1abc9c'];
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };
  
  const handleVipSubscription = () => {
    navigate('/vip-courses?tab=purchase');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-10">
          <div className="animate-pulse space-y-8">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-2/3">
                <div className="h-10 bg-muted rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-muted rounded w-1/2 mb-6"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                </div>
              </div>
              <div className="w-full md:w-1/3">
                <div className="h-64 bg-muted rounded"></div>
              </div>
            </div>
            <div className="h-8 bg-muted rounded w-48"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-10 text-center">
          <Info className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Không tìm thấy khóa học</h1>
          <p className="text-muted-foreground mb-6">Khóa học này không tồn tại hoặc đã bị xóa</p>
          <Button onClick={() => navigate('/courses')}>Xem tất cả khóa học</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-10">
        {isVipRequired && !vipStatus.isVip && (
          <Alert variant="warning" className="mb-8">
            <Crown className="h-4 w-4" />
            <AlertDescription>
              Đây là khóa học VIP. Bạn cần đăng ký gói VIP để truy cập nội dung này.
              <Button 
                variant="outline" 
                className="ml-4 bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
                onClick={handleVipSubscription}
              >
                Đăng ký VIP
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
              <p className="text-muted-foreground">{course.description}</p>
              
              <div className="flex flex-wrap gap-2 mt-4">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {course.duration}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  {course.totalLessons} bài học
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {course.totalTests} bài kiểm tra
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  {course.level}
                </Badge>
                {isVipRequired && (
                  <Badge className="bg-yellow-500 text-white flex items-center gap-1">
                    <Crown className="h-3 w-3" />
                    VIP
                  </Badge>
                )}
              </div>
            </div>
            
            {enrolled && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Tiến độ của bạn</h3>
                  <span className="text-sm font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
            
            <div className="prose dark:prose-invert max-w-none mb-8">
              <h2 className="text-2xl font-bold mb-4">Tổng quan khóa học</h2>
              <div dangerouslySetInnerHTML={{ __html: course.fullDescription }} />
            </div>
            
            {course.requirements.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Yêu cầu</h2>
                <ul className="space-y-2 list-disc pl-5">
                  {course.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {course.objectives.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Bạn sẽ học được</h2>
                <ul className="space-y-2">
                  {course.objectives.map((obj, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Nội dung khóa học</h2>
              
              {!enrolled && (
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Hãy đăng ký khóa học để truy cập đầy đủ nội dung bài học
                  </AlertDescription>
                </Alert>
              )}
              
              <Accordion type="single" collapsible className="w-full">
                {course.chapters.map((chapter, index) => (
                  <AccordionItem key={chapter.id} value={`chapter-${index}`}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex flex-col items-start text-left">
                        <div className="text-base font-medium">Chương {index + 1}: {chapter.title}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {chapter.lessons.length} bài học • {chapter.lessons.reduce((acc, lesson) => acc + parseInt(lesson.duration.split(' ')[0]), 0)} phút
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pt-2 space-y-2">
                        {chapter.description && (
                          <p className="text-sm text-muted-foreground mb-4">{chapter.description}</p>
                        )}
                        
                        {chapter.lessons.map((lesson, lessonIndex) => (
                          <div 
                            key={lesson.id}
                            className={`flex items-center justify-between p-3 rounded-md ${
                              lesson.completed ? 'bg-green-50 dark:bg-green-900/10' : 'hover:bg-accent/50'
                            } transition-colors`}
                          >
                            <div className="flex items-center">
                              {lesson.type === 'video' ? (
                                <Video className="h-4 w-4 mr-3" />
                              ) : lesson.type === 'test' ? (
                                <FileText className="h-4 w-4 mr-3" />
                              ) : (
                                <BookOpen className="h-4 w-4 mr-3" />
                              )}
                              
                              <div>
                                <div className="font-medium">{lessonIndex + 1}. {lesson.title}</div>
                                <div className="text-xs text-muted-foreground">
                                  {lesson.type === 'test' ? `Bài kiểm tra • ${lesson.questions} câu hỏi` : `${lesson.type === 'video' ? 'Video' : 'Bài học'} • ${lesson.duration}`}
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              {lesson.completed ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : enrolled ? (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => navigate(`/course/${courseId}/chapter/${chapter.id}/lesson/${lesson.id}`)}
                                >
                                  Học ngay
                                </Button>
                              ) : (
                                <Lock className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className={`overflow-hidden shadow-md ${isVipRequired ? 'border-2 border-yellow-400' : ''}`}>
                <div 
                  className="aspect-video w-full" 
                  style={{ backgroundColor: course.color }} 
                >
                  <img 
                    src={course.image} 
                    alt={course.title} 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }} 
                  />
                </div>
                
                <CardContent className="p-6">
                  <div className="mb-6">
                    <CardTitle className="text-2xl mb-2 flex items-center gap-2">
                      {isVipRequired ? (
                        <>
                          <Crown className="h-5 w-5 text-yellow-500" />
                          <span className="bg-gradient-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent">
                            Khóa Học VIP
                          </span>
                        </>
                      ) : (
                        "Miễn phí"
                      )}
                    </CardTitle>
                    <CardDescription>
                      {isVipRequired 
                        ? "Truy cập đặc quyền với gói VIP" 
                        : "Truy cập toàn bộ nội dung khóa học"}
                    </CardDescription>
                  </div>
                  
                  {enrolled ? (
                    <>
                      <Button 
                        className={`w-full mb-3 ${isVipRequired ? 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600' : ''}`}
                        onClick={continueCourse}
                      >
                        {progress > 0 ? 'Tiếp tục học' : 'Bắt đầu học'}
                      </Button>
                      
                      <Link to={`/course-test/${courseId}`}>
                        <Button 
                          variant="outline" 
                          className="w-full"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Bài kiểm tra tổng quát
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      {isVipRequired && !vipStatus.isVip ? (
                        <>
                          <Button 
                            className="w-full mb-3 bg-yellow-600 hover:bg-yellow-700" 
                            onClick={handleVipSubscription}
                          >
                            <Crown className="h-4 w-4 mr-2" />
                            Đăng ký VIP
                          </Button>
                          <p className="text-sm text-muted-foreground text-center">
                            Bạn cần đăng ký gói VIP để truy cập khóa học này
                          </p>
                        </>
                      ) : (
                        <Button 
                          className={`w-full ${isVipRequired ? 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600' : ''}`}
                          onClick={handleEnroll}
                          disabled={enrolling}
                        >
                          {enrolling ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Đang đăng ký...
                            </>
                          ) : (
                            'Đăng ký khóa học'
                          )}
                        </Button>
                      )}
                    </>
                  )}
                </CardContent>
                
                <Separator />
                
                <CardFooter className="px-6 py-4">
                  <div className="w-full">
                    <h3 className="font-medium mb-3">Khóa học bao gồm:</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>{course.totalLessons} bài học</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>{course.totalTests} bài kiểm tra</span>
                      </li>
                      {isVipRequired ? (
                        <>
                          <li className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            <span>Nội dung chuyên sâu cao cấp</span>
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            <span>Hỗ trợ trực tiếp từ giảng viên</span>
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            <span>Chứng chỉ hoàn thành có giá trị</span>
                          </li>
                        </>
                      ) : (
                        <>
                          <li className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            <span>Truy cập vĩnh viễn</span>
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            <span>Chứng chỉ hoàn thành</span>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
