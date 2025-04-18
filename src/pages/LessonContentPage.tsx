import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ChevronLeft, ChevronRight, BookOpen, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { api } from '@/integrations/api/client';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import GreenButton from '@/components/GreenButton';
import { saveLessonProgress, getLessonPages } from '@/services/userProgressServices';
import { toNumberId, toStringId, idsAreEqual, supabaseId } from '@/utils/idConverter';
import { Lesson, LessonPage, Chapter, Page } from '@/models/lesson';

interface LessonProgress {
  completed: boolean;
  position: number | { scrollPosition: number };
  current_page_id?: number | string;
}

const LessonContentPage = () => {
  const { courseId, chapterId, lessonId } = useParams<{ courseId: string; chapterId: string; lessonId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextLesson, setNextLesson] = useState<Lesson | { id: number | string; title: string; isTest: boolean } | null>(null);
  const [prevLesson, setPrevLesson] = useState<Lesson | null>(null);
  const [lessonProgress, setLessonProgress] = useState<LessonProgress>({
    completed: false,
    position: 0
  });
  
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  
  useEffect(() => {
    const fetchLessonContent = async () => {
      if (!courseId || !chapterId || !lessonId || !user) return;
      
      try {
        setLoading(true);
        
        // First, fetch chapter info
        const { data: chapterData, error: chapterError } = await api
          .from('chapters')
          .select('*')
          .eq('id', supabaseId(chapterId))
          .single();
          
        if (chapterError) {
          console.error('Error fetching chapter:', chapterError);
          toast.error('Không thể tải thông tin chương học');
          setLoading(false);
          return;
        }
        
        // Cast the chapter data to work with our Chapter type
        const chapter = {
          ...chapterData,
          id: chapterData.id // Keep as string from DB
        } as unknown as Chapter;
        setChapter(chapter);
        
        // Then fetch the lesson
        const { data: lessonData, error: lessonError } = await api
          .from('lessons')
          .select('*')
          .eq('id', supabaseId(lessonId))
          .single();
          
        if (lessonError) {
          console.error('Error fetching lesson:', lessonError);
          toast.error('Không thể tải bài học');
          setLoading(false);
          return;
        }

        // Cast the lesson data to our Lesson type
        const lesson = {
          ...lessonData,
          id: lessonData.id // Keep as string from DB
        } as unknown as Lesson;
        setLesson(lesson);

        // Fetch lesson pages using the modified function
        const result = await getLessonPages(lessonId);
        
        if (result.success && result.pages) {
          // Now pages will have the correct properties: lesson_id and order_index
          setPages(result.pages as Page[]);
        } else {
          // Create a default page
          setPages([
            {
              id: 0,
              lesson_id: lessonId,
              content: lessonData.content || "",
              order_index: 1
            } as Page
          ]);
        }
        
        // For lesson navigation, ensure proper type comparison with id
        const { data: navigationData, error: navigationError } = await api
          .from('lessons')
          .select('id, title, order_index')
          .eq('chapter_id', supabaseId(chapterId))
          .order('order_index', { ascending: true });
          
        if (navigationError) {
          console.error('Error fetching navigation data:', navigationError);
        } else {
          // Find current lesson index
          const currentIndex = navigationData.findIndex(item => 
            String(item.id) === String(lessonId) // Compare as strings
          );
          
          if (currentIndex > 0) {
            setPrevLesson({
              ...navigationData[currentIndex - 1],
              // Add required properties for the Lesson type
              content: '',
              type: 'unknown',
              chapter_id: chapterId
            } as unknown as Lesson);
          }
          
          if (currentIndex < navigationData.length - 1) {
            setNextLesson({
              ...navigationData[currentIndex + 1],
              // Add required properties for the Lesson type
              content: '',
              type: 'unknown',
              chapter_id: chapterId
            } as unknown as Lesson);
          } else {
            const { data: testLesson, error: testError } = await api
              .from('lessons')
              .select('*')
              .eq('chapter_id', supabaseId(chapterId))
              .eq('type', 'test')
              .maybeSingle();
              
            if (!testError && testLesson) {
              setNextLesson({ 
                ...testLesson, 
                id: testLesson.id, 
                isTest: true 
              } as { id: number | string; title: string; isTest: boolean });
            }
          }
        }
        
        const { data: progressData, error: progressError } = await api
          .from('user_lesson_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('lesson_id', supabaseId(lessonId))
          .maybeSingle();
          
        if (!progressError && progressData) {
          const currentPageId = progressData.current_page_id;
          if (currentPageId && result.pages) {
            // Updated to match against the same type
            const pageIndex = result.pages.findIndex((p: any) => String(p.id) === String(currentPageId)) || 0;
            if (pageIndex >= 0) {
              setCurrentPageIndex(pageIndex);
            }
          }
          
          setLessonProgress({
            completed: progressData.completed,
            position: progressData.last_position ? JSON.parse(progressData.last_position) : 0,
            current_page_id: progressData.current_page_id
          });
        }
        
      } catch (err) {
        console.error('Error fetching lesson:', err);
        setError('Không thể tải nội dung bài học');
        toast.error('Không thể tải nội dung bài học');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLessonContent();
  }, [courseId, chapterId, lessonId, user, navigate]);
  
  const handlePageChange = async (newIndex: number) => {
    if (newIndex < 0 || newIndex >= pages.length) return;
    
    setCurrentPageIndex(newIndex);
    
    if (user && courseId && lessonId && pages[newIndex]) {
      try {
        await saveLessonProgress(
          user.id,
          courseId,
          chapterId || "0",
          lessonId,
          { scrollPosition: 0 },
          false,
          pages[newIndex].id
        );
      } catch (err) {
        console.error('Error saving page progress:', err);
      }
    }
  };
  
  const markAsCompleted = async () => {
    if (!user || !courseId || !chapterId || !lessonId) return;
    
    try {
      await saveLessonProgress(
        user.id,
        courseId,
        chapterId,
        lessonId
      );
      
      setLessonProgress({ ...lessonProgress, completed: true });
      toast.success('Đã đánh dấu bài học là đã hoàn thành');
      
      if (nextLesson) {
        if ('isTest' in nextLesson) {
          navigate(`/course/${courseId}/chapter/${chapterId}/test/${nextLesson.id}`);
        } else {
          navigate(`/course/${courseId}/chapter/${chapterId}/lesson/${nextLesson.id}`);
        }
      } else {
        const { data: chapters, error: chaptersError } = await api
          .from('chapters')
          .select('id, order_index')
          .eq('course_id', supabaseId(courseId))
          .order('order_index', { ascending: true });
          
        if (!chaptersError && chapters) {
          const currentChapterIndex = chapters.findIndex(c => String(c.id) === String(chapterId));
          if (currentChapterIndex < chapters.length - 1) {
            navigate(`/course/${courseId}/chapter/${chapters[currentChapterIndex + 1].id}`);
          } else {
            navigate(`/course/${courseId}/start`);
          }
        }
      }
    } catch (err) {
      console.error('Error marking lesson as completed:', err);
      toast.error('Không thể đánh dấu bài học là đã hoàn thành');
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
  
  if (error || !lesson) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container max-w-4xl py-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Không thể tải nội dung bài học</h2>
          <p className="text-gray-500 mb-8">{error || 'Bài học không tồn tại hoặc đã bị xóa'}</p>
          <Button onClick={() => navigate(`/course/${courseId}/start`)}>
            Quay lại khóa học
          </Button>
        </div>
      </div>
    );
  }

  const currentPage = pages[currentPageIndex];
  
  return (
    <div className="min-h-screen pt-20">
      <Navbar />
      
      <div className="container max-w-4xl py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="flex items-center text-sm text-muted-foreground mb-1">
              <Button variant="ghost" size="sm" className="p-0 h-auto mr-2" onClick={() => navigate(`/course/${courseId}/chapter/${chapterId}`)}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Quay lại chương
              </Button>
              <span className="mx-2">•</span>
              <BookOpen className="h-4 w-4 mr-1" />
              <span>{chapter?.title}</span>
            </div>
            <h1 className="text-2xl font-bold">{lesson?.title}</h1>
          </div>
          
          <Badge variant={lessonProgress.completed ? "secondary" : "outline"} className={lessonProgress.completed ? "bg-green-500 hover:bg-green-600 text-white" : ""}>
            {lessonProgress.completed ? "Đã hoàn thành" : "Chưa hoàn thành"}
          </Badge>
        </div>
        
        <Card className="mb-8">
          <CardContent className="p-6">
            {pages.length > 1 && (
              <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <Button 
                  variant="outline" 
                  onClick={() => handlePageChange(currentPageIndex - 1)}
                  disabled={currentPageIndex === 0}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Trang trước
                </Button>
                
                <div className="text-sm">
                  Trang {currentPageIndex + 1} / {pages.length}
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={() => handlePageChange(currentPageIndex + 1)}
                  disabled={currentPageIndex === pages.length - 1}
                >
                  Trang sau
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}

            <div 
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: currentPage?.content || lesson.content }}
            />

            {pages.length > 1 && (
              <div className="flex justify-between items-center mt-6 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => handlePageChange(currentPageIndex - 1)}
                  disabled={currentPageIndex === 0}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Trang trước
                </Button>
                
                <Progress
                  value={(currentPageIndex + 1) / pages.length * 100}
                  className="w-full max-w-[200px] mx-4 h-2"
                />
                
                <Button 
                  variant="outline" 
                  onClick={() => handlePageChange(currentPageIndex + 1)}
                  disabled={currentPageIndex === pages.length - 1}
                >
                  Trang sau
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="flex justify-between items-center">
          <div>
            {prevLesson && (
              <Button variant="outline" onClick={() => navigate(`/course/${courseId}/chapter/${chapterId}/lesson/${prevLesson.id}`)}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Bài trước
              </Button>
            )}
          </div>
          
          <GreenButton onClick={markAsCompleted}>
            {nextLesson ? 'Hoàn thành & Tiếp tục' : 'Hoàn thành bài học'}
          </GreenButton>
        </div>
      </div>
    </div>
  );
};

export default LessonContentPage;
