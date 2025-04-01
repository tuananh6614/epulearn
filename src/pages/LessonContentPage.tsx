
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ChevronLeft, ChevronRight, BookOpen, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import GreenButton from '@/components/GreenButton';
import { saveLessonProgress, getLessonPages } from '@/integrations/supabase/userProgressServices';

// Định nghĩa kiểu dữ liệu
interface Lesson {
  id: string;
  title: string;
  content: string;
  type: string;
  order_index: number;
  chapter_id: string;
}

interface Chapter {
  id: string;
  title: string;
  course_id: string;
  order_index: number;
}

interface LessonProgress {
  completed: boolean;
  position: number | { scrollPosition: number };
  current_page_id?: number;
}

interface Page {
  id: number;
  lesson_id: string;
  content: string;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

const LessonContentPage = () => {
  const { courseId, chapterId, lessonId } = useParams<{ courseId: string; chapterId: string; lessonId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextLesson, setNextLesson] = useState<Lesson | { id: string; title: string; isTest: boolean } | null>(null);
  const [prevLesson, setPrevLesson] = useState<Lesson | null>(null);
  const [lessonProgress, setLessonProgress] = useState<LessonProgress>({
    completed: false,
    position: 0
  });
  
  // Thêm state cho pages
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!courseId || !chapterId || !lessonId || !user) return;
      
      try {
        setLoading(true);
        
        // Get chapter info
        const { data: chapterData, error: chapterError } = await supabase
          .from('chapters')
          .select('*')
          .eq('id', chapterId)
          .single();
          
        if (chapterError) throw chapterError;
        setChapter(chapterData as Chapter);
        
        // Get current lesson
        const { data: lessonData, error: lessonError } = await supabase
          .from('lessons')
          .select('*')
          .eq('id', lessonId)
          .single();
          
        if (lessonError) throw lessonError;
        setLesson(lessonData as Lesson);
        
        // Get lesson pages using our new function
        const { success, pages: pagesData, error: pagesError } = await getLessonPages(lessonId);
        
        if (pagesError) throw pagesError;
        
        if (success && pagesData && pagesData.length > 0) {
          setPages(pagesData as Page[]);
        } else {
          // If no pages exist yet, create a single page with the lesson content
          setPages([
            {
              id: 0, // Temporary ID
              lesson_id: lessonId,
              content: lessonData.content,
              order_index: 1
            }
          ]);
        }
        
        // Get all lessons in this chapter for navigation
        const { data: chapterLessons, error: chapterLessonsError } = await supabase
          .from('lessons')
          .select('id, title, order_index')
          .eq('chapter_id', chapterId)
          .order('order_index', { ascending: true });
          
        if (chapterLessonsError) throw chapterLessonsError;
        
        if (chapterLessons && chapterLessons.length > 0) {
          const currentIndex = chapterLessons.findIndex(l => l.id === lessonId);
          
          if (currentIndex > 0) {
            setPrevLesson(chapterLessons[currentIndex - 1] as Lesson);
          }
          
          if (currentIndex < chapterLessons.length - 1) {
            setNextLesson(chapterLessons[currentIndex + 1] as Lesson);
          } else {
            // If this is the last lesson, check if there's a chapter test
            const { data: testLesson, error: testError } = await supabase
              .from('lessons')
              .select('*')
              .eq('chapter_id', chapterId)
              .eq('type', 'test')
              .maybeSingle();
              
            if (!testError && testLesson) {
              setNextLesson({ ...testLesson, isTest: true } as { id: string; title: string; isTest: boolean });
            }
          }
        }
        
        // Get lesson progress
        const { data: progressData, error: progressError } = await supabase
          .from('user_lesson_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('lesson_id', lessonId)
          .maybeSingle();
          
        if (!progressError && progressData) {
          // If we have progress data with current_page_id, set the current page
          const currentPageId = progressData.current_page_id;
          if (currentPageId) {
            // Find the page in our pages array
            const pageIndex = pagesData?.findIndex((p: Page) => p.id === currentPageId) || 0;
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
    
    fetchData();
  }, [courseId, chapterId, lessonId, user]);
  
  const handlePageChange = async (newIndex: number) => {
    if (newIndex < 0 || newIndex >= pages.length) return;
    
    setCurrentPageIndex(newIndex);
    
    // Save progress with current page
    if (user && courseId && lessonId && pages[newIndex]) {
      try {
        await saveLessonProgress(
          user.id,
          courseId,
          lessonId,
          chapterId || "",
          { scrollPosition: 0 }, // Reset scroll position for new page
          false, // Not completed yet
          pages[newIndex].id // Save current page ID
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
        lessonId,
        chapterId,
        { scrollPosition: window.scrollY },
        true,
        pages[currentPageIndex]?.id
      );
      
      setLessonProgress({ ...lessonProgress, completed: true });
      toast.success('Đã đánh dấu bài học là đã hoàn thành');
      
      // Navigate to next lesson if available
      if (nextLesson) {
        if ('isTest' in nextLesson) {
          navigate(`/course/${courseId}/chapter/${chapterId}/test/${nextLesson.id}`);
        } else {
          navigate(`/course/${courseId}/chapter/${chapterId}/lesson/${nextLesson.id}`);
        }
      } else {
        // If no next lesson, check if there's another chapter
        const { data: chapters, error: chaptersError } = await supabase
          .from('chapters')
          .select('id, order_index')
          .eq('course_id', courseId)
          .order('order_index', { ascending: true });
          
        if (!chaptersError && chapters) {
          const currentChapterIndex = chapters.findIndex(c => c.id === chapterId);
          if (currentChapterIndex < chapters.length - 1) {
            // Navigate to next chapter
            navigate(`/course/${courseId}/chapter/${chapters[currentChapterIndex + 1].id}`);
          } else {
            // Back to course overview
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
            <h1 className="text-2xl font-bold">{lesson.title}</h1>
          </div>
          
          <Badge variant={lessonProgress.completed ? "secondary" : "outline"} className={lessonProgress.completed ? "bg-green-500 hover:bg-green-600 text-white" : ""}>
            {lessonProgress.completed ? "Đã hoàn thành" : "Chưa hoàn thành"}
          </Badge>
        </div>
        
        <Card className="mb-8">
          <CardContent className="p-6">
            {/* Hiển thị page pagination nếu có nhiều trang */}
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

            {/* Page navigation footer if multiple pages */}
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
