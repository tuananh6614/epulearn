
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardHeader, CardContent, CardDescription, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CheckCircle, Clock, FileText, Info, Loader2, Lock, Zap, BookOpen, Video } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from "@/components/ui/use-toast"
import { fetchCourseContent, supabase } from '@/integrations/supabase/client';

// Define types for our UI components to correctly handle the data
interface DisplayLesson {
  id: string;
  title: string;
  type: 'lesson' | 'test' | 'video';
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

const getCourseColor = (category: string) => {
  switch (category) {
    case 'JavaScript':
      return 'yellow';
    case 'React':
      return 'blue';
    case 'Node':
      return 'green';
    default:
      return 'gray';
  }
};

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<DisplayCourse>({
    id: '',
    title: '',
    description: '',
    fullDescription: '',
    level: 'Beginner',
    duration: '0h',
    totalLessons: 0,
    totalTests: 0,
    image: '',
    color: 'blue',
    requirements: [],
    objectives: [],
    chapters: []
  });
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  useEffect(() => {
    const checkEnrollmentStatus = async () => {
      if (!user || !courseId) {
        setLoading(false);
        return;
      }

      try {
        // Check if user is enrolled in the course
        const { data, error } = await supabase
          .from('user_courses')
          .select('progress_percentage')
          .eq('user_id', user.id)
          .eq('course_id', courseId)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking enrollment:', error);
          toast({
            title: "Lỗi kiểm tra trạng thái",
            description: "Đã có lỗi xảy ra khi kiểm tra trạng thái đăng ký khóa học.",
            variant: "destructive"
          });
        }

        if (data) {
          setEnrolled(true);
          setProgress(data.progress_percentage || 0);
        } else {
          setEnrolled(false);
          setProgress(0);
        }
      } catch (error) {
        console.error('Error in enrollment check:', error);
        toast({
          title: "Lỗi kiểm tra trạng thái",
          description: "Đã có lỗi xảy ra khi kiểm tra trạng thái đăng ký khóa học.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    checkEnrollmentStatus();
  }, [courseId, user, toast]);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        console.log('Fetching course data for:', courseId);
        
        // Use the new fetchCourseContent function for better structured data
        if (courseId) {
          const courseContent = await fetchCourseContent(courseId);
          
          if (courseContent) {
            // Transform API data to match our display model
            const formattedChapters: DisplayChapter[] = courseContent.chapters.map(chapter => ({
              id: chapter.id,
              title: chapter.title,
              description: chapter.description || '',
              lessons: chapter.lessons.map(lesson => ({
                id: lesson.id,
                title: lesson.title,
                type: lesson.type as 'lesson' | 'test' | 'video',
                duration: lesson.duration,
                completed: false, // Will be updated if user is enrolled
                questions: lesson.type === 'test' ? 
                  chapter.tests?.filter(test => test.chapter_id === chapter.id)?.length || 0 : 0
              }))
            }));
            
            // Calculate total lessons and tests
            let totalLessons = 0;
            let totalTests = 0;
            
            formattedChapters.forEach(chapter => {
              chapter.lessons.forEach(lesson => {
                if (lesson.type === 'lesson' || lesson.type === 'video') {
                  totalLessons++;
                } else if (lesson.type === 'test') {
                  totalTests++;
                }
              });
            });
            
            setCourse({
              id: courseContent.id,
              title: courseContent.title,
              description: courseContent.description,
              fullDescription: courseContent.full_description || courseContent.description,
              level: courseContent.level,
              duration: courseContent.duration,
              totalLessons,
              totalTests,
              image: courseContent.thumbnail_url || '/placeholder.svg',
              color: getCourseColor(courseContent.category),
              requirements: courseContent.requirements || [],
              objectives: courseContent.objectives || [],
              chapters: formattedChapters
            } as DisplayCourse);
            
            console.log('Course data loaded successfully');
          } else {
            console.error('No course found with ID:', courseId);
            navigate('/courses');
            toast({
              title: "Khóa học không tồn tại",
              description: "Không tìm thấy khóa học này.",
              variant: "destructive"
            });
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching course data:', error);
        setLoading(false);
        toast({
          title: "Lỗi tải dữ liệu",
          description: "Đã có lỗi xảy ra khi tải thông tin khóa học.",
          variant: "destructive"
        });
      }
    };
    
    fetchCourseData();
  }, [courseId, navigate, toast]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      // Add user to course
      const { error } = await supabase
        .from('user_courses')
        .upsert({
          user_id: user?.id,
          course_id: courseId,
          progress_percentage: 0,
          enrolled_at: new Date().toISOString(),
          last_accessed: new Date().toISOString()
        });

      if (error) {
        console.error('Error enrolling in course:', error);
        toast({
          title: "Lỗi đăng ký",
          description: "Đã có lỗi xảy ra khi đăng ký khóa học.",
          variant: "destructive"
        });
      } else {
        setEnrolled(true);
        setProgress(0);
        toast({
          title: "Đăng ký thành công",
          description: "Bạn đã đăng ký khóa học thành công!",
        });
      }
    } catch (error) {
      console.error('Error during enrollment:', error);
      toast({
        title: "Lỗi đăng ký",
        description: "Đã có lỗi xảy ra khi đăng ký khóa học.",
        variant: "destructive"
      });
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container max-w-screen-xl mx-auto px-4 pt-24 pb-10">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        {/* Course Hero Header */}
        <div className={`bg-${course.color}-50 dark:bg-${course.color}-900/10 py-12 border-b`}>
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-start gap-8">
              {/* Course Image */}
              <div className="w-full md:w-1/3 lg:w-1/4">
                <div className="aspect-video bg-muted rounded-lg overflow-hidden shadow-lg">
                  <img
                    src={course.image || '/placeholder.svg'}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              {/* Course Info */}
              <div className="flex-1">
                <div className="space-y-4">
                  <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
                  <p className="text-muted-foreground">{course.description}</p>
                  
                  <div className="flex flex-wrap gap-3">
                    <Badge variant="outline" className="text-xs">
                      <Zap className="h-3 w-3 mr-1" />
                      {course.level}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {course.duration}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <BookOpen className="h-3 w-3 mr-1" />
                      {course.totalLessons} Bài học
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <FileText className="h-3 w-3 mr-1" />
                      {course.totalTests} Bài kiểm tra
                    </Badge>
                  </div>
                  
                  {enrolled ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Tiến độ khóa học</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                      
                      <div className="flex flex-wrap gap-3">
                        <Button 
                          onClick={() => navigate(`/course/${courseId}/chapter/${course.chapters[0]?.id}/lesson/${course.chapters[0]?.lessons[0]?.id}`)}
                        >
                          {progress > 0 ? 'Tiếp tục học' : 'Bắt đầu khóa học'}
                        </Button>
                        
                        <Button variant="outline" onClick={() => navigate(`/course/${courseId}/test`)}>
                          <FileText className="h-4 w-4 mr-2" />
                          Kiểm tra tổng quát
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      onClick={handleEnroll} 
                      disabled={enrolling}
                      className="mt-2"
                    >
                      {enrolling ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang xử lý
                        </>
                      ) : (
                        'Đăng ký khóa học'
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Course Content */}
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="lg:w-2/3 space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full border-b rounded-none justify-start">
                  <TabsTrigger value="overview" className="text-base">Tổng quan</TabsTrigger>
                  <TabsTrigger value="content" className="text-base">Nội dung khóa học</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-6 pt-4">
                  <div>
                    <h2 className="text-2xl font-semibold mb-4">Giới thiệu khóa học</h2>
                    <div className="prose dark:prose-invert max-w-none">
                      <p>{course.fullDescription}</p>
                    </div>
                  </div>
                  
                  {course.objectives.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-semibold mb-4">Bạn sẽ học được gì</h2>
                      <ul className="space-y-2">
                        {course.objectives.map((objective, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                            <span>{objective}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {course.requirements.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-semibold mb-4">Yêu cầu</h2>
                      <ul className="space-y-2">
                        {course.requirements.map((req, index) => (
                          <li key={index} className="flex items-start">
                            <Info className="h-5 w-5 text-blue-500 mr-2 shrink-0 mt-0.5" />
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="content" className="pt-4">
                  <h2 className="text-2xl font-semibold mb-4">Nội dung khóa học</h2>
                  
                  <Accordion type="multiple" className="w-full">
                    {course.chapters.map((chapter, chapterIndex) => (
                      <AccordionItem key={chapter.id} value={`chapter-${chapterIndex}`}>
                        <AccordionTrigger className="text-base hover:no-underline">
                          <div className="text-left">
                            <div className="font-semibold">Phần {chapterIndex + 1}: {chapter.title}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {chapter.lessons.length} bài học
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-1 pt-2">
                            {chapter.description && (
                              <p className="text-sm text-muted-foreground mb-3">{chapter.description}</p>
                            )}
                            
                            {chapter.lessons.map((lesson, lessonIndex) => {
                              const isAvailable = enrolled || lessonIndex === 0;
                              const lessonUrl = enrolled ? 
                                `/course/${courseId}/chapter/${chapter.id}/lesson/${lesson.id}` : 
                                null;
                                
                              return (
                                <div 
                                  key={lesson.id} 
                                  className={`flex items-center p-2 rounded-md ${
                                    isAvailable ? 'hover:bg-muted/50 cursor-pointer' : 'opacity-60'
                                  }`}
                                  onClick={() => isAvailable && lessonUrl && navigate(lessonUrl)}
                                >
                                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-muted mr-3">
                                    {lesson.type === 'video' && <Video className="h-4 w-4" />}
                                    {lesson.type === 'lesson' && <BookOpen className="h-4 w-4" />}
                                    {lesson.type === 'test' && <FileText className="h-4 w-4" />}
                                  </div>
                                  
                                  <div className="flex-1">
                                    <div className="text-sm font-medium flex items-center">
                                      {lesson.title}
                                      {lesson.completed && (
                                        <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                                      )}
                                    </div>
                                    <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {lesson.duration}
                                      
                                      {lesson.type === 'test' && lesson.questions > 0 && (
                                        <span className="ml-2 flex items-center">
                                          <FileText className="h-3 w-3 mr-1" />
                                          {lesson.questions} câu hỏi
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {!isAvailable && (
                                    <Lock className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Sidebar */}
            <div className="lg:w-1/3 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin khóa học</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Cấp độ</span>
                    <span className="font-medium">{course.level}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Tổng thời gian</span>
                    <span className="font-medium">{course.duration}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Số bài học</span>
                    <span className="font-medium">{course.totalLessons}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Bài kiểm tra</span>
                    <span className="font-medium">{course.totalTests}</span>
                  </div>
                  
                  {enrolled && (
                    <>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Tiến độ</span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                    </>
                  )}
                </CardContent>
                
                {!enrolled && (
                  <CardFooter>
                    <Button 
                      onClick={handleEnroll} 
                      disabled={enrolling}
                      className="w-full"
                    >
                      {enrolling ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang xử lý
                        </>
                      ) : (
                        'Đăng ký khóa học'
                      )}
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
