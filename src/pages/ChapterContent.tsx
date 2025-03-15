
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, ArrowRight, BookOpen, CheckCircle, PlayCircle, FileText } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ChapterTest from '@/components/ChapterTest';
import { saveLessonProgress } from '@/integrations/supabase/userProgressServices';
import Navbar from '@/components/Navbar';
import { Separator } from '@/components/ui/separator';

const ChapterContent: React.FC = () => {
  const { courseId, chapterId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [chapter, setChapter] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [courseTitle, setCourseTitle] = useState('');
  const [progress, setProgress] = useState(0);
  const [testQuestions, setTestQuestions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('content');
  const [nextChapter, setNextChapter] = useState<any>(null);
  const [prevChapter, setPrevChapter] = useState<any>(null);
  
  useEffect(() => {
    if (!courseId || !chapterId || !user) return;
    
    const fetchChapterData = async () => {
      try {
        setLoading(true);
        
        // Fetch chapter details
        const { data: chapterData, error: chapterError } = await supabase
          .from('chapters')
          .select('*')
          .eq('id', chapterId)
          .single();
          
        if (chapterError) throw chapterError;
        
        // Fetch course details for title
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('title')
          .eq('id', courseId)
          .single();
          
        if (courseError) throw courseError;
        
        // Fetch all lessons for this chapter
        const { data: lessonData, error: lessonError } = await supabase
          .from('lessons')
          .select('*')
          .eq('chapter_id', chapterId)
          .order('order_index', { ascending: true });
          
        if (lessonError) throw lessonError;
        
        // Fetch test questions for this chapter
        const { data: testData, error: testError } = await supabase
          .from('chapter_tests')
          .select('*')
          .eq('chapter_id', chapterId);
          
        if (testError) throw testError;
        
        // Fetch user progress for all lessons in this chapter
        const { data: progressData, error: progressError } = await supabase
          .from('user_lesson_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('chapter_id', chapterId);
          
        if (progressError) throw progressError;
        
        // Get next and previous chapters
        const { data: allChapters, error: chaptersError } = await supabase
          .from('chapters')
          .select('*')
          .eq('course_id', courseId)
          .order('order_index', { ascending: true });
          
        if (chaptersError) throw chaptersError;
        
        // Find current chapter index
        const currentIndex = allChapters.findIndex(ch => ch.id === chapterId);
        if (currentIndex > 0) {
          setPrevChapter(allChapters[currentIndex - 1]);
        }
        
        if (currentIndex < allChapters.length - 1) {
          setNextChapter(allChapters[currentIndex + 1]);
        }
        
        // Calculate progress
        let completedCount = 0;
        const lessonsWithProgress = lessonData.map(lesson => {
          const progressItem = progressData?.find(p => p.lesson_id === lesson.id);
          const isCompleted = progressItem?.completed || false;
          if (isCompleted) completedCount++;
          
          return {
            ...lesson,
            completed: isCompleted
          };
        });
        
        const progressPercentage = lessonData.length > 0 
          ? Math.round((completedCount / lessonData.length) * 100) 
          : 0;
        
        // Format test questions
        const formattedQuestions = testData.map(question => ({
          id: question.id,
          question: question.question,
          options: question.options,
          answer: question.correct_answer
        }));
        
        setChapter(chapterData);
        setCourseTitle(courseData.title);
        setLessons(lessonsWithProgress);
        setProgress(progressPercentage);
        setTestQuestions(formattedQuestions);
        
      } catch (error) {
        console.error('Error fetching chapter data:', error);
        toast.error('Không thể tải dữ liệu chương học');
      } finally {
        setLoading(false);
      }
    };
    
    fetchChapterData();
  }, [chapterId, courseId, user]);
  
  const handleLessonClick = (lessonId: string) => {
    navigate(`/course/${courseId}/chapter/${chapterId}/lesson/${lessonId}`);
  };
  
  const handleTestComplete = async (score: number, total: number) => {
    try {
      // Find the test lesson in this chapter
      const testLesson = lessons.find(lesson => lesson.type === 'test');
      
      if (testLesson && user) {
        // Mark the test as completed if score is 70% or higher
        const passed = Math.round((score / total) * 100) >= 70;
        
        // Save test progress
        await saveLessonProgress(
          user.id,
          courseId || '',
          testLesson.id,
          chapterId || '',
          { score, total, percentage: Math.round((score / total) * 100) },
          passed
        );
        
        toast.success(
          passed 
            ? 'Chúc mừng! Bạn đã hoàn thành bài kiểm tra' 
            : 'Bạn có thể thử lại bài kiểm tra sau khi xem lại bài học'
        );
        
        // Refresh the page to update progress
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      console.error('Error saving test result:', error);
      toast.error('Không thể lưu kết quả kiểm tra');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container max-w-6xl py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-3/4">
            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-muted-foreground" 
                  onClick={() => navigate(`/course/${courseId}`)}
                >
                  {courseTitle}
                </Button>
                <span>/</span>
                <span>{chapter?.title}</span>
              </div>
              
              <h1 className="text-3xl font-bold">{chapter?.title}</h1>
              <p className="text-muted-foreground mt-2">
                {chapter?.description || 'Không có mô tả cho chương này'}
              </p>
              
              <div className="flex items-center gap-2 mt-4">
                <Progress value={progress} className="h-2 flex-1" />
                <span className="text-sm font-medium">{progress}%</span>
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList>
                <TabsTrigger value="content">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Nội dung chương
                </TabsTrigger>
                <TabsTrigger value="test">
                  <FileText className="h-4 w-4 mr-2" />
                  Bài kiểm tra
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="content" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Danh sách bài học</CardTitle>
                    <CardDescription>
                      Hoàn thành tất cả các bài học để mở khóa bài kiểm tra chương
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      {lessons.map((lesson, index) => (
                        <div 
                          key={lesson.id}
                          className={`p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all flex items-center gap-3 ${
                            lesson.completed ? 'bg-primary/5' : ''
                          }`}
                          onClick={() => handleLessonClick(lesson.id)}
                        >
                          <div className="flex-shrink-0">
                            {lesson.completed ? (
                              <CheckCircle className="h-5 w-5 text-primary" />
                            ) : lesson.type === 'video' ? (
                              <PlayCircle className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <BookOpen className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <h3 className="font-medium">{lesson.title}</h3>
                              <span className="text-sm text-muted-foreground">{lesson.duration}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {lesson.type === 'video' ? 'Video bài giảng' : 
                               lesson.type === 'test' ? 'Bài kiểm tra' : 'Bài học'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between">
                    {prevChapter ? (
                      <Button 
                        variant="outline" 
                        onClick={() => navigate(`/course/${courseId}/chapter/${prevChapter.id}`)}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Chương trước
                      </Button>
                    ) : (
                      <Button variant="outline" onClick={() => navigate(`/course/${courseId}`)}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Quay lại khóa học
                      </Button>
                    )}
                    
                    {nextChapter && (
                      <Button 
                        onClick={() => navigate(`/course/${courseId}/chapter/${nextChapter.id}`)}
                      >
                        Chương tiếp theo
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="test" className="mt-4">
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Kiểm tra kiến thức</CardTitle>
                    <CardDescription>
                      Trả lời các câu hỏi bên dưới để kiểm tra kiến thức của bạn về chương này
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    {lessons.some(lesson => !lesson.completed && lesson.type !== 'test') ? (
                      <Alert className="bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                        <AlertDescription>
                          Bạn cần hoàn thành tất cả các bài học trước khi làm bài kiểm tra này.
                        </AlertDescription>
                      </Alert>
                    ) : testQuestions.length === 0 ? (
                      <Alert>
                        <AlertDescription>
                          Hiện tại chưa có bài kiểm tra nào cho chương này.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <ChapterTest 
                        questions={testQuestions} 
                        onComplete={handleTestComplete}
                        chapterId={chapterId || ''}
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="w-full lg:w-1/4">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin chương học</CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Tiến độ</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={progress} className="h-2 flex-1" />
                      <span className="text-sm font-medium">{progress}%</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Số bài học</h3>
                    <p className="font-medium">{lessons.length} bài học</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Đã hoàn thành</h3>
                    <p className="font-medium">
                      {lessons.filter(l => l.completed).length}/{lessons.length} bài học
                    </p>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setActiveTab('test')}
                  disabled={lessons.some(lesson => !lesson.completed && lesson.type !== 'test')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Làm bài kiểm tra
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterContent;
