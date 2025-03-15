
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, Loader2, ChevronLeft, ChevronRight, 
  BookOpen, PlayCircle, FileText, ArrowRight
} from 'lucide-react';
import { 
  Card, CardContent, CardDescription, 
  CardFooter, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import GreenButton from '@/components/GreenButton';

const ChapterContent = () => {
  const { courseId, chapterId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [chapter, setChapter] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [course, setCourse] = useState<any>(null);
  const [previousChapter, setPreviousChapter] = useState<any>(null);
  const [nextChapter, setNextChapter] = useState<any>(null);
  const [lessonProgress, setLessonProgress] = useState<Record<string, any>>({});
  const [chapterProgress, setChapterProgress] = useState(0);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!courseId || !chapterId || !user) return;
      
      try {
        setLoading(true);
        
        // Fetch course details
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .single();
          
        if (courseError) throw courseError;
        setCourse(courseData);
        
        // Fetch chapter details
        const { data: chapterData, error: chapterError } = await supabase
          .from('chapters')
          .select('*')
          .eq('id', chapterId)
          .single();
          
        if (chapterError) throw chapterError;
        setChapter(chapterData);
        
        // Fetch chapter lessons
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('lessons')
          .select('*')
          .eq('chapter_id', chapterId)
          .order('order_index', { ascending: true });
          
        if (lessonsError) throw lessonsError;
        setLessons(lessonsData || []);
        
        // Fetch all chapters for navigation
        const { data: chaptersData, error: chaptersError } = await supabase
          .from('chapters')
          .select('id, title, order_index')
          .eq('course_id', courseId)
          .order('order_index', { ascending: true });
          
        if (chaptersError) throw chaptersError;
        
        if (chaptersData && chaptersData.length > 0) {
          const currentIndex = chaptersData.findIndex(c => c.id === chapterId);
          
          if (currentIndex > 0) {
            setPreviousChapter(chaptersData[currentIndex - 1]);
          }
          
          if (currentIndex < chaptersData.length - 1) {
            setNextChapter(chaptersData[currentIndex + 1]);
          }
        }
        
        // Fetch user progress
        const { data: progressData, error: progressError } = await supabase
          .from('user_lesson_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('chapter_id', chapterId);
          
        if (progressError) throw progressError;
        
        const progressMap: Record<string, any> = {};
        progressData?.forEach(item => {
          progressMap[item.lesson_id] = item;
        });
        
        setLessonProgress(progressMap);
        
        // Calculate chapter progress
        if (lessonsData && lessonsData.length > 0) {
          const completedLessons = lessonsData.filter(
            lesson => progressMap[lesson.id]?.completed
          ).length;
          
          const progressPercentage = Math.round(
            (completedLessons / lessonsData.length) * 100
          );
          
          setChapterProgress(progressPercentage);
        }
        
      } catch (error) {
        console.error('Error fetching chapter data:', error);
        toast.error('Không thể tải dữ liệu chương học');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [courseId, chapterId, user]);
  
  const handleLessonClick = (lessonId: string) => {
    navigate(`/course/${courseId}/chapter/${chapterId}/lesson/${lessonId}`);
  };
  
  const handleStartChapterTest = () => {
    navigate(`/course/${courseId}/chapter/${chapterId}/test`);
  };
  
  const handleContinueLearning = () => {
    // Find first incomplete lesson
    const incompleteLesson = lessons.find(
      lesson => !lessonProgress[lesson.id]?.completed
    );
    
    if (incompleteLesson) {
      handleLessonClick(incompleteLesson.id);
    } else if (lessons.length > 0) {
      // If all lessons completed, go to the test or first lesson
      handleStartChapterTest();
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container max-w-4xl py-8 flex items-center justify-center h-[80vh]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }
  
  if (!chapter || !course) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container max-w-4xl py-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Không tìm thấy chương học</h2>
          <p className="text-gray-500 mb-8">Chương học này không tồn tại hoặc đã bị xóa</p>
          <Button onClick={() => navigate(`/course/${courseId}/start`)}>
            Quay lại khóa học
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container max-w-4xl py-8">
        <div className="flex items-center mb-2">
          <Button variant="ghost" size="sm" className="p-0 h-auto" onClick={() => navigate(`/course/${courseId}/start`)}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Quay lại khóa học
          </Button>
          <span className="mx-2 text-muted-foreground">•</span>
          <span className="text-sm text-muted-foreground">{course.title}</span>
        </div>
        
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">
              Chương: {chapter.title}
            </h1>
            <p className="text-muted-foreground">{chapter.description}</p>
          </div>
          
          <Badge 
            variant={chapterProgress === 100 ? "secondary" : "outline"} 
            className={chapterProgress === 100 ? "bg-green-500 hover:bg-green-600 text-white" : ""}
          >
            {chapterProgress === 100 ? (
              <CheckCircle className="h-3 w-3 mr-1" />
            ) : null}
            {chapterProgress}% hoàn thành
          </Badge>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Tiến độ của bạn</CardTitle>
            <CardDescription>
              Đã hoàn thành {Object.values(lessonProgress).filter(p => p.completed).length}/{lessons.length} bài học
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Progress value={chapterProgress} className="h-2" />
          </CardContent>
          
          <CardFooter>
            <GreenButton 
              className="w-full"
              onClick={handleContinueLearning}
            >
              Tiếp tục học
            </GreenButton>
          </CardFooter>
        </Card>
        
        <div className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-primary" />
            Nội dung chương học
          </h2>
          
          <div className="space-y-3">
            {lessons.map((lesson, index) => {
              const isCompleted = lessonProgress[lesson.id]?.completed || false;
              
              return (
                <div 
                  key={lesson.id}
                  className={`p-4 border rounded-lg flex items-center justify-between hover:border-primary/50 cursor-pointer transition-all ${
                    isCompleted ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' : ''
                  }`}
                  onClick={() => handleLessonClick(lesson.id)}
                >
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary mr-3">
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : lesson.type === 'video' ? (
                        <PlayCircle className="h-4 w-4" />
                      ) : (
                        <FileText className="h-4 w-4" />
                      )}
                    </div>
                    
                    <div>
                      <div className="font-medium">{lesson.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {lesson.type === 'video' ? 'Video' : 'Bài học'} • {lesson.duration}
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="icon">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
            
            {/* Chapter test */}
            <div 
              className="p-4 border rounded-lg flex items-center justify-between hover:border-primary/50 cursor-pointer transition-all bg-orange-50 dark:bg-orange-900/10"
              onClick={handleStartChapterTest}
            >
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/20 text-orange-500 mr-3">
                  <FileText className="h-4 w-4" />
                </div>
                
                <div>
                  <div className="font-medium">Bài kiểm tra: {chapter.title}</div>
                  <div className="text-sm text-muted-foreground">
                    15 câu hỏi • 15 phút
                  </div>
                </div>
              </div>
              
              <Button variant="ghost" size="icon">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between mt-8">
          {previousChapter ? (
            <Button 
              variant="outline" 
              onClick={() => navigate(`/course/${courseId}/chapter/${previousChapter.id}`)}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Chương trước
            </Button>
          ) : (
            <div></div>
          )}
          
          {nextChapter && (
            <Button 
              onClick={() => navigate(`/course/${courseId}/chapter/${nextChapter.id}`)}
            >
              Chương tiếp theo
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChapterContent;
