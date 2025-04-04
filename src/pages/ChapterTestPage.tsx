import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import ChapterTest from '@/components/ChapterTest';
import Navbar from '@/components/Navbar';
import { fetchChapterTest, saveTestResult } from '@/services/testServices';
import { api } from '@/integrations/api/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toStringId } from '@/utils/idConverter';
import { toast } from 'sonner';

const ChapterTestPage = () => {
  const { courseId, chapterId, lessonId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chapterTitle, setChapterTitle] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [testQuestions, setTestQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    const loadTest = async () => {
      try {
        setLoading(true);
        
        const test = await fetchChapterTest(chapterId || '0');
        
        if (!test) {
          toast.error('Không thể tải bài kiểm tra');
          return;
        }
        
        const formattedQuestions = test.questions.map(q => ({
          id: q.id,
          question: q.question,
          options: q.options,
          answer: q.correct_answer
        }));
        
        setTestQuestions(formattedQuestions);
        
        const { data: chapterData, error: chapterError } = await api
          .from('chapters')
          .select('title, courses(title)')
          .eq('id', toStringId(chapterId || '0'))
          .limit(1);
        
        if (chapterError) {
          console.error('Error fetching chapter:', chapterError);
        } else if (chapterData && chapterData.length > 0) {
          setChapterTitle(chapterData[0].title);
          setCourseTitle(chapterData[0].courses?.title || '');
        }
      } catch (error) {
        console.error('Error loading test:', error);
        toast.error('Có lỗi xảy ra khi tải bài kiểm tra');
      } finally {
        setLoading(false);
      }
    };
    
    loadTest();
  }, [chapterId, courseId, lessonId, user, navigate]);
  
  const handleTestComplete = async (score: number, total: number) => {
    if (!user || !chapterId || !courseId) return;
    
    try {
      const percentScore = Math.round((score / total) * 100);
      const passed = percentScore >= 70;
      
      const saveResult = await saveTestResult({
        user_id: user.id,
        course_id: courseId,
        chapter_id: chapterId,
        score: percentScore,
        passed
      });
      
      if (saveResult) {
        console.log('Test result saved successfully');
      }
      
      if (lessonId && passed) {
        const { error } = await api
          .from('user_lesson_progress')
          .upsert({
            user_id: user.id,
            lesson_id: toStringId(lessonId),
            course_id: toStringId(courseId),
            chapter_id: toStringId(chapterId),
            completed: true,
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        if (error) {
          console.error('Error marking lesson as completed:', error);
        }
      }
    } catch (error) {
      console.error('Error saving test result:', error);
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container pt-20 pb-10 max-w-4xl">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="mr-2"
            onClick={() => navigate(`/course/${courseId}/chapter/${chapterId}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{chapterTitle}</h2>
            <p className="text-muted-foreground text-sm">{courseTitle}</p>
          </div>
        </div>
        
        <ChapterTest
          questions={testQuestions}
          onComplete={handleTestComplete}
          chapterId={chapterId || '0'}
          courseId={courseId || '0'}
          lessonId={lessonId}
        />
      </div>
    </div>
  );
};

export default ChapterTestPage;
