
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { fetchTestQuestions, saveTestResult } from '@/integrations/supabase/testServices';
import ChapterTest, { TestQuestion } from '@/components/ChapterTest'; 
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const ChapterTestPage: React.FC = () => {
  const { user } = useAuth();
  const { courseId, chapterId, lessonId } = useParams<{ courseId: string; chapterId: string; lessonId: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [highestScore, setHighestScore] = useState<number | null>(null);
  
  useEffect(() => {
    if (!courseId || !chapterId) {
      toast.error("Thông tin bài kiểm tra không hợp lệ");
      navigate(`/courses`);
      return;
    }
    
    const loadQuestions = async () => {
      try {
        setLoading(true);
        
        // Fetch test questions from Supabase
        const testQuestions = await fetchTestQuestions(chapterId);
        
        if (!testQuestions || testQuestions.length === 0) {
          toast.error("Không tìm thấy câu hỏi cho bài kiểm tra này");
          navigate(`/course/${courseId}`);
          return;
        }
        
        // Format questions for the test component
        // Make sure options are converted to string[] explicitly
        const formattedQuestions: TestQuestion[] = testQuestions.map((q) => ({
          id: q.id,
          question: q.question,
          options: Array.isArray(q.options) 
            ? q.options.map(option => String(option)) 
            : [],
          answer: q.correct_answer
        }));
        
        setQuestions(formattedQuestions);
        
        // Fetch highest score for this test if user is logged in
        if (user && chapterId) {
          try {
            const { data, error } = await supabase
              .from('user_test_results')
              .select('score')
              .eq('user_id', user.id)
              .eq('chapter_id', chapterId)
              .order('score', { ascending: false })
              .limit(1);
              
            if (error) {
              console.error('Error fetching highest score:', error);
            } else if (data && data.length > 0) {
              setHighestScore(data[0].score);
            }
          } catch (err) {
            console.error('Error fetching highest score:', err);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading test questions:', error);
        toast.error("Không thể tải câu hỏi kiểm tra");
        setLoading(false);
      }
    };
    
    loadQuestions();
  }, [courseId, chapterId, navigate, user]);
  
  const handleTestComplete = async (score: number, total: number) => {
    if (!user || !courseId || !chapterId) {
      toast.error("Không thể lưu kết quả kiểm tra");
      return;
    }
    
    // Calculate if passed (70% or more)
    const percentage = Math.round((score / total) * 100);
    const passed = percentage >= 70;
    
    // Check if it's a new high score
    const isNewHighScore = highestScore === null || percentage > highestScore;
    if (isNewHighScore) {
      setHighestScore(percentage);
    }
    
    // Save user answers (simply dummy data for now)
    const answers = {
      score: score,
      total: total,
      percentage: percentage,
      timestamp: new Date().toISOString()
    };
    
    // Save the test result to Supabase
    try {
      console.log(`Saving test result: ${score}/${total}, passed: ${passed}`);
      
      const result = await saveTestResult(
        user.id,
        courseId,
        chapterId,
        lessonId || '',
        score,
        total,
        answers
      );
      
      // Also save to user_test_results for history tracking
      const { error: historyError } = await supabase
        .from('user_test_results')
        .insert({
          user_id: user.id,
          course_id: courseId,
          chapter_id: chapterId,
          score: percentage,
          passed: passed,
          answers: answers,
          created_at: new Date().toISOString()
        });
        
      if (historyError) {
        console.error('Error saving test history:', historyError);
      }
      
      if (result.success) {
        toast.success(`Bạn đã hoàn thành bài kiểm tra với kết quả ${score}/${total}`);
        
        if (isNewHighScore && percentage >= 70) {
          toast.success("Chúc mừng! Đây là điểm cao nhất của bạn cho bài kiểm tra này!");
        }
        
        // Navigate back to course detail
        setTimeout(() => {
          navigate(`/course/${courseId}`);
        }, 2000);
      } else {
        toast.error("Không thể lưu kết quả kiểm tra");
      }
    } catch (error) {
      console.error('Error saving test result:', error);
      toast.error("Đã xảy ra lỗi khi lưu kết quả");
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        <h1 className="text-3xl font-bold mb-8 text-center">Bài kiểm tra kiến thức</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <ChapterTest 
            questions={questions} 
            onComplete={handleTestComplete}
            chapterId={chapterId || ''}
          />
        )}
      </div>
    </div>
  );
};

export default ChapterTestPage;
