
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import ChapterTest from '@/components/ChapterTest';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GreenButton from '@/components/GreenButton';

const ChapterTestPage = () => {
  const { courseId, chapterId, lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testCompleted, setTestCompleted] = useState(false);
  const [testPassed, setTestPassed] = useState(false);
  const [nextChapterId, setNextChapterId] = useState<string | null>(null);

  useEffect(() => {
    const fetchNextChapter = async () => {
      if (!courseId || !chapterId) return;
      
      try {
        // Find the current chapter's index
        const { data: chapters, error: chaptersError } = await supabase
          .from('chapters')
          .select('id, order_index')
          .eq('course_id', courseId)
          .order('order_index', { ascending: true });
          
        if (chaptersError) throw chaptersError;
        
        if (chapters && chapters.length > 0) {
          const currentChapterIndex = chapters.findIndex(chapter => chapter.id === chapterId);
          if (currentChapterIndex !== -1 && currentChapterIndex < chapters.length - 1) {
            // Get the next chapter
            setNextChapterId(chapters[currentChapterIndex + 1].id);
          }
        }
      } catch (err) {
        console.error('Error fetching next chapter:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNextChapter();
  }, [courseId, chapterId]);

  // Update this function to accept score and total parameters
  const handleTestComplete = (score: number, total: number) => {
    // Calculate if the test is passed (typically 70% or more is passing)
    const passPercentage = 70;
    const scorePercentage = (score / total) * 100;
    const passed = scorePercentage >= passPercentage;
    
    setTestCompleted(true);
    setTestPassed(passed);
  };

  const handleContinue = () => {
    if (nextChapterId) {
      // Navigate to the next chapter
      navigate(`/course/${courseId}/chapter/${nextChapterId}`);
    } else {
      // If there's no next chapter, go back to the course page
      navigate(`/course/${courseId}/start`);
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

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container max-w-4xl py-8">
        {testCompleted ? (
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold mb-4">
              {testPassed ? "Chúc mừng! Bạn đã hoàn thành bài kiểm tra" : "Bạn chưa vượt qua bài kiểm tra"}
            </h1>
            <p className="text-xl mb-8">
              {testPassed 
                ? "Bạn đã vượt qua bài kiểm tra này và sẵn sàng cho chương tiếp theo!" 
                : "Đừng lo lắng, bạn có thể học lại và thử lại bài kiểm tra."}
            </p>
            
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => navigate(`/course/${courseId}/start`)}>
                Về trang khóa học
              </Button>
              
              {testPassed && nextChapterId ? (
                <GreenButton onClick={handleContinue}>
                  Tiếp tục học chương tiếp theo
                </GreenButton>
              ) : (
                <Button onClick={() => window.location.reload()}>
                  Làm lại bài kiểm tra
                </Button>
              )}
            </div>
          </div>
        ) : (
          <ChapterTest 
            courseId={courseId || ''} 
            chapterId={chapterId || ''} 
            lessonId={lessonId}
            onComplete={handleTestComplete}
          />
        )}
      </div>
    </div>
  );
};

export default ChapterTestPage;
