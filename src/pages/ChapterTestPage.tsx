
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { fetchTestQuestions, saveTestResult } from '@/integrations/supabase/testServices';
import ChapterTest from '@/components/ChapterTest';  // Changed from { ChapterTest }
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface ChapterTestPageProps {}

const ChapterTestPage: React.FC<ChapterTestPageProps> = () => {
  const { user } = useAuth();
  const { courseId, chapterId, lessonId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<any[]>([]);
  
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
        const formattedQuestions = testQuestions.map((q) => ({
          id: q.id,
          question: q.question,
          options: Array.isArray(q.options) ? q.options : [],
          answer: q.correct_answer
        }));
        
        setQuestions(formattedQuestions);
        setLoading(false);
      } catch (error) {
        console.error('Error loading test questions:', error);
        toast.error("Không thể tải câu hỏi kiểm tra");
        setLoading(false);
      }
    };
    
    loadQuestions();
  }, [courseId, chapterId, navigate]);
  
  const handleTestComplete = async (score: number, passed: boolean) => {
    if (!user || !courseId || !chapterId) {
      toast.error("Không thể lưu kết quả kiểm tra");
      return;
    }
    
    // Save the test result to Supabase
    try {
      const total = questions.length;
      const result = await saveTestResult(
        user.id,
        courseId,
        chapterId,
        lessonId || '',
        score,
        total
      );
      
      if (result.success) {
        toast.success(`Bạn đã hoàn thành bài kiểm tra với kết quả ${score}/${total}`);
        
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
          />
        )}
      </div>
    </div>
  );
};

export default ChapterTestPage;
