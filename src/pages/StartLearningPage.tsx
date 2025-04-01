import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, BookOpen, CheckCircle, ArrowLeft, ArrowRight, PlayCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { useCourseData } from '@/hooks/useCourseData';
import { getCourseProgress } from '@/integrations/supabase/userProgressServices';
import { fetchCourseTests } from '@/integrations/supabase/courseServices';
import { toNumberId } from '@/utils/idConverter';

interface Lesson {
  id: string;
  title: string;
  type?: string;
  duration?: string;
  content?: string;
}

interface Chapter {
  id: string;
  title: string;
  lessons?: Lesson[];
}

interface Course {
  id: string;
  title: string;
  duration: string;
  chapters?: Chapter[];
}

interface LessonProgress {
  id?: string;
  user_id?: string;
  lesson_id: string;
  course_id?: string;
  completed: boolean;
  last_position?: string; // Có thể là JSON string
}

interface CourseTest {
  id?: string;
  course_id?: string;
  passing_score?: number;
  time_limit?: number;
  questions?: { id: string; question: string }[];
}

const StartLearningPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const numericCourseId = toNumberId(courseId);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [lessonProgress, setLessonProgress] = useState<Record<string, LessonProgress>>({});
  const [activeTab, setActiveTab] = useState<'chapters' | 'all-lessons' | 'tests'>('chapters');
  const [courseTests, setCourseTests] = useState<CourseTest[]>([]);
  
  const { courseData, userProgress, isEnrolled, error } = useCourseData(numericCourseId);
  
  useEffect(() => {
    if (!numericCourseId || !user) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch user progress for all lessons in this course
        const { data: progressData, error: progressError } = await supabase
          .from('user_lesson_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('course_id', numericCourseId);
          
        if (progressError) throw progressError;
        
        // Convert to a map for easier lookup
        const progressMap: Record<string, LessonProgress> = {};
        progressData?.forEach((item) => {
          progressMap[item.lesson_id] = item;
        });
        
        setLessonProgress(progressMap);
        
        // Fetch course tests
        const tests = await fetchCourseTests(numericCourseId);
        setCourseTests(tests || []);
        
      } catch (error) {
        console.error('Error fetching course data:', error);
        toast.error('Không thể tải dữ liệu khóa học');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [numericCourseId, user]);
  
  const handleChapterClick = (chapterId: string) => {
    navigate(`/course/${numericCourseId}/chapter/${chapterId}`);
  };
  
  const handleLessonClick = (chapterId: string, lessonId: string) => {
    navigate(`/course/${numericCourseId}/chapter/${chapterId}/lesson/${lessonId}`);
  };
  
  const handleCourseTestClick = () => {
    navigate(`/course/${numericCourseId}/test`);
  };
  
  const handleTestHistoryClick = () => {
    navigate(`/course/${numericCourseId}/test-history`);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!courseData) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col">
        <h2 className="text-2xl font-bold mb-2">Không tìm thấy khóa học</h2>
        <p className="text-muted-foreground mb-4">Khóa học này không tồn tại hoặc đã bị xóa</p>
        <Button onClick={() => navigate('/courses')}>Quay lại danh sách khóa học</Button>
      </div>
    );
  }
  
  if (!isEnrolled) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col">
        <h2 className="text-2xl font-bold mb-2">Bạn chưa đăng ký khóa học này</h2>
        <p className="text-muted-foreground mb-4">Vui lòng đăng ký khóa học để bắt đầu học</p>
        <Button onClick={() => navigate(`/course/${numericCourseId}`)}>Đăng ký khóa học</Button>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background pt-20">
      <Navbar />
      
      <div className="container max-w-6xl py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">{courseData.title}</h1>
            <p className="text-muted-foreground mt-1">Tiếp tục học tập từ nơi bạn đã dừng lại</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate(`/course/${numericCourseId}`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại tổng quan
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs 
              value={activeTab} 
              onValueChange={(value: 'chapters' | 'all-lessons' | 'tests') => setActiveTab(value)} 
              className="w-full"
            >
              <TabsList className="mb-6">
                <TabsTrigger value="chapters">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Chương học
                </TabsTrigger>
                <TabsTrigger value="all-lessons">
                  <FileText className="h-4 w-4 mr-2" />
                  Tất cả bài học
                </TabsTrigger>
                <TabsTrigger value="tests">
                  <FileText className="h-4 w-4 mr-2" />
                  Bài kiểm tra
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="chapters" className="space-y-6">
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Nội dung khóa học</CardTitle>
                    <CardDescription>
                      Khóa học gồm {courseData.chapters?.length || 0} chương và {
                        courseData.chapters?.reduce((total, chapter) => total + (chapter.lessons?.length || 0), 0)
                      } bài học
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {courseData?.chapters.map((chapter, index) => {
                      const chapterLessons = chapter.lessons || [];
                      const completedLessons = chapterLessons.filter(lesson => lessonProgress[lesson.id]?.completed).length;
                      const totalLessons = chapterLessons.length;
                      const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
                      
                      return (
                        <div 
                          key={chapter.id} 
                          className="border rounded-lg p-4 hover:border-primary/50 transition-all cursor-pointer"
                          onClick={() => handleChapterClick(chapter.id)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium flex items-center">
                              <BookOpen className="h-4 w-4 text-primary mr-2" />
                              {chapter.title}
                            </h3>
                            <Badge variant={progressPercentage === 100 ? "secondary" : "outline"} className={progressPercentage === 100 ? "bg-green-500 hover:bg-green-600 text-white" : ""}>
                              {progressPercentage === 100 ? (
                                <CheckCircle className="h-3 w-3 mr-1" />
                              ) : null}
                              {progressPercentage}%
                            </Badge>
                          </div>
                          
                          <Progress value={progressPercentage} className="h-1 mb-2" />
                          
                          <div className="text-sm text-muted-foreground flex justify-between">
                            <span>{totalLessons} bài học</span>
                            <span>{completedLessons}/{totalLessons} hoàn thành</span>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="all-lessons" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Tất cả bài học</CardTitle>
                    <CardDescription>
                      Danh sách đầy đủ các bài học trong khóa học
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {courseData?.chapters.map((chapter) => (
                      <div key={chapter.id} className="space-y-2">
                        <h3 className="font-medium text-lg">{chapter.title}</h3>
                        <Separator className="my-2" />
                        
                        <div className="space-y-2">
                          {chapter.lessons?.map((lesson) => {
                            const isCompleted = lessonProgress[lesson.id]?.completed || false;
                            
                            return (
                              <div 
                                key={lesson.id}
                                className={`p-3 rounded-md border flex items-center justify-between hover:border-primary/50 cursor-pointer ${
                                  isCompleted ? 'bg-primary/5' : ''
                                }`}
                                onClick={() => handleLessonClick(chapter.id, lesson.id)}
                              >
                                <div className="flex items-center">
                                  {isCompleted ? (
                                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                                  ) : lesson.type === 'video' ? (
                                    <PlayCircle className="h-4 w-4 text-muted-foreground mr-2" />
                                  ) : (
                                    <FileText className="h-4 w-4 text-muted-foreground mr-2" />
                                  )}
                                  <span className="font-medium">{lesson.title}</span>
                                </div>
                                
                                <div className="flex items-center">
                                  <span className="text-sm text-muted-foreground mr-3">{lesson.duration}</span>
                                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="tests" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Bài kiểm tra</CardTitle>
                    <CardDescription>
                      Kiểm tra kiến thức của bạn với các bài kiểm tra
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Course final test */}
                    {courseTests.length > 0 ? (
                      <div className="border rounded-lg p-4 hover:border-primary/50 transition-all cursor-pointer"
                        onClick={handleCourseTestClick}>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium flex items-center">
                            <FileText className="h-4 w-4 text-primary mr-2" />
                            Bài kiểm tra tổng kết khóa học
                          </h3>
                          <Badge variant="outline">
                            {courseTests[0]?.passing_score || 70}% để đạt
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-muted-foreground flex justify-between mt-2">
                          <span>{courseTests[0]?.questions?.length || 0} câu hỏi</span>
                          <span>{courseTests[0]?.time_limit || 30} phút</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        Chưa có bài kiểm tra nào cho khóa học này
                      </div>
                    )}
                    
                    {/* Chapter tests */}
                    {courseData?.chapters.map((chapter) => {
                      // Find test lesson in this chapter
                      const testLesson = chapter.lessons?.find(lesson => lesson.type === 'test');
                      if (!testLesson) return null;
                      
                      const isCompleted = lessonProgress[testLesson.id]?.completed || false;
                      
                      return (
                        <div 
                          key={chapter.id}
                          className="border rounded-lg p-4 hover:border-primary/50 transition-all cursor-pointer"
                          onClick={() => navigate(`/course/${numericCourseId}/chapter/${chapter.id}/test/${testLesson.id}`)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium flex items-center">
                              <FileText className="h-4 w-4 text-primary mr-2" />
                              Kiểm tra: {chapter.title}
                            </h3>
                            <Badge variant={isCompleted ? "secondary" : "outline"} className={isCompleted ? "bg-green-500 hover:bg-green-600 text-white" : ""}>
                              {isCompleted ? (
                                <CheckCircle className="h-3 w-3 mr-1" />
                              ) : null}
                              {isCompleted ? "Đã hoàn thành" : "Chưa hoàn thành"}
                            </Badge>
                          </div>
                          
                          <div className="text-sm text-muted-foreground mt-2">
                            Kiểm tra kiến thức của bạn về chương này
                          </div>
                        </div>
                      );
                    })}
                    
                    <div className="flex justify-center mt-4">
                      <Button variant="outline" onClick={handleTestHistoryClick}>
                        Xem lịch sử làm bài
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tiến độ khóa học</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Hoàn thành</span>
                    <span className="text-sm font-medium">{userProgress}%</span>
                  </div>
                  <Progress value={userProgress} className="h-2" />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Tổng số chương</span>
                    <span className="text-sm font-medium">{courseData.chapters?.length || 0}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Tổng số bài học</span>
                    <span className="text-sm font-medium">
                      {courseData.chapters?.reduce((total, chapter) => total + (chapter.lessons?.length || 0), 0)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Thời lượng</span>
                    <span className="text-sm font-medium">{courseData.duration}</span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button className="w-full" onClick={() => {
                  // Find first incomplete lesson
                  for (const chapter of courseData.chapters || []) {
                    for (const lesson of chapter.lessons || []) {
                      if (!lessonProgress[lesson.id]?.completed) {
                        handleLessonClick(chapter.id, lesson.id);
                        return;
                      }
                    }
                  }
                  
                  // If all lessons are completed, go to the first lesson
                  if (courseData.chapters?.[0]?.lessons?.[0]) {
                    const firstChapter = courseData.chapters[0];
                    const firstLesson = firstChapter.lessons[0];
                    handleLessonClick(firstChapter.id, firstLesson.id);
                  }
                }}>
                  Tiếp tục học
                </Button>
              </CardFooter>
            </Card>
            
            {courseTests.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Bài kiểm tra cuối khóa</CardTitle>
                </CardHeader>
                
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Hoàn thành bài kiểm tra cuối khóa để nhận chứng chỉ hoàn thành
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Số câu hỏi</span>
                      <span className="text-sm font-medium">{courseTests[0]?.questions?.length || 0}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Thời gian</span>
                      <span className="text-sm font-medium">{courseTests[0]?.time_limit || 30} phút</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Điểm đạt</span>
                      <span className="text-sm font-medium">{courseTests[0]?.passing_score || 70}%</span>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleCourseTestClick}
                  >
                    Làm bài kiểm tra
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartLearningPage;
