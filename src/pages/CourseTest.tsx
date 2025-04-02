
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { fetchCourseTests, saveTestResult } from '@/integrations/supabase/testServices';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { CourseTest, TestQuestion } from '@/models/lesson';
import { supabaseId } from '@/utils/idConverter';

// Type for our local course test state
type CourseTestType = CourseTest;

const CourseTestPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [testData, setTestData] = useState<CourseTestType | null>(null);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [testStarted, setTestStarted] = useState(false);
  const [testComplete, setTestComplete] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!id || !currentUser) {
      toast.error('Không tìm thấy bài kiểm tra hoặc bạn chưa đăng nhập');
      navigate('/courses');
      return;
    }
    
    const loadTest = async () => {
      try {
        setLoading(true);
        const result = await fetchCourseTests(id);
        
        if (result.success && result.test) {
          const testData = {
            id: result.test.id,
            title: result.test.title,
            description: result.test.description,
            passing_score: result.test.passing_score || 80,
            time_limit: result.test.time_limit || 30,
            questions: result.test.questions || [],
            course_id: result.test.course_id,
            created_at: result.test.created_at,
            updated_at: result.test.updated_at
          };
          
          setTestData(testData);
          setQuestions(result.test.questions || []);
          setTimeLeft(result.test.time_limit ? result.test.time_limit * 60 : 30 * 60);
        } else if (result.success && result.tests && result.tests.length > 0) {
          const testData = {
            id: result.tests[0].id,
            title: result.tests[0].title,
            description: result.tests[0].description,
            passing_score: result.tests[0].passing_score,
            time_limit: result.tests[0].time_limit,
            questions: result.tests[0].questions || [],
            course_id: result.tests[0].course_id,
            created_at: result.tests[0].created_at,
            updated_at: result.tests[0].updated_at
          };
          
          setTestData(testData);
          setQuestions(result.tests[0].questions || []);
          setTimeLeft(result.tests[0].time_limit ? result.tests[0].time_limit * 60 : 30 * 60);
        } else {
          toast.error('Không tìm thấy bài kiểm tra');
          navigate('/courses');
        }
      } catch (error) {
        console.error('Error loading test:', error);
        toast.error('Không thể tải bài kiểm tra');
      } finally {
        setLoading(false);
      }
    };
    
    loadTest();
  }, [id, navigate, currentUser]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (testStarted && timeLeft > 0 && !testComplete) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(timer);
  }, [testStarted, timeLeft, testComplete]);

  const handleAnswerSelect = (questionId: string | number, answerIndex: number) => {
    setSelectedAnswers(prev => ({ ...prev, [String(questionId)]: answerIndex }));
  };

  const handleSubmitTest = async () => {
    if (!testData || !currentUser) return;
    
    setSubmitting(true);
    
    try {
      // Calculate score
      let correctAnswers = 0;
      let totalPoints = 0;
      
      questions.forEach(q => {
        const selectedAnswer = selectedAnswers[String(q.id)];
        if (selectedAnswer === q.correct_answer) {
          correctAnswers += q.points || 1;
        }
        totalPoints += q.points || 1;
      });
      
      const scorePercentage = Math.round((correctAnswers / totalPoints) * 100);
      const passed = scorePercentage >= (testData.passing_score || 80);
      
      setScore(scorePercentage);
      setTestComplete(true);
      
      // Save result to Supabase
      await saveTestResult(
        currentUser.id,
        supabaseId(testData.course_id),
        supabaseId(testData.id),
        scorePercentage,
        passed
      );
      
      if (passed) {
        toast.success(`Chúc mừng! Bạn đã vượt qua bài kiểm tra với số điểm ${scorePercentage}%`);
      } else {
        toast.error(`Bạn không vượt qua được bài kiểm tra. Điểm số của bạn: ${scorePercentage}%`);
      }
    } catch (error) {
      console.error('Error submitting test:', error);
      toast.error('Không thể gửi kết quả bài kiểm tra');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const startTest = () => {
    setTestStarted(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!testData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Không tìm thấy bài kiểm tra</h2>
          <p className="text-gray-500">Bài kiểm tra không tồn tại hoặc đã bị xóa</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-3xl py-8 pt-20">
        <h1 className="text-3xl font-bold mb-2">{testData.title}</h1>
        <p className="text-gray-500 mb-6">{testData.description}</p>
        
        {!testStarted ? (
          <div className="bg-card p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Thông tin bài kiểm tra</h2>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center">
                <span className="w-40 font-medium">Thời gian:</span>
                <span>{testData.time_limit} phút</span>
              </li>
              <li className="flex items-center">
                <span className="w-40 font-medium">Số câu hỏi:</span>
                <span>{questions.length} câu</span>
              </li>
              <li className="flex items-center">
                <span className="w-40 font-medium">Điểm đạt:</span>
                <span>{testData.passing_score}%</span>
              </li>
            </ul>
            <Button onClick={startTest} className="w-full">
              Bắt đầu làm bài
            </Button>
          </div>
        ) : testComplete ? (
          <div className="bg-card p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Kết quả bài kiểm tra</h2>
            <div className="mb-6">
              <div className="flex items-center justify-center">
                <div className={`text-4xl font-bold ${score >= (testData.passing_score || 80) ? 'text-green-600' : 'text-red-600'}`}>
                  {score}%
                </div>
              </div>
              <div className="text-center mt-2">
                {score >= (testData.passing_score || 80) ? (
                  <p className="text-green-600 font-medium">Chúc mừng! Bạn đã vượt qua bài kiểm tra.</p>
                ) : (
                  <p className="text-red-600 font-medium">Bạn chưa vượt qua bài kiểm tra. Hãy thử lại sau!</p>
                )}
              </div>
            </div>
            <div className="space-y-6">
              {questions.map((question, index) => (
                <div key={String(question.id)} className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">
                    <span className="font-bold">Câu {index + 1}:</span> {question.question}
                  </h3>
                  <div className="space-y-2 ml-6">
                    {question.options.map((option, optIndex) => (
                      <div 
                        key={optIndex}
                        className={`p-2 rounded ${
                          optIndex === question.correct_answer
                            ? 'bg-green-100 border border-green-300'
                            : selectedAnswers[String(question.id)] === optIndex && optIndex !== question.correct_answer
                            ? 'bg-red-100 border border-red-300'
                            : 'bg-gray-50 border'
                        }`}
                      >
                        {option}
                        {optIndex === question.correct_answer && (
                          <span className="ml-2 text-green-600 font-medium">(Đáp án đúng)</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={() => navigate(`/course/${testData.course_id}`)} className="w-full mt-6">
              Quay lại khóa học
            </Button>
          </div>
        ) : (
          <>
            <div className="sticky top-0 bg-background z-10 p-4 border rounded-lg mb-6 flex justify-between items-center">
              <div className="flex items-center">
                <span className="font-medium mr-2">Thời gian còn lại:</span>
                <span className={`font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-primary'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              <Button 
                onClick={handleSubmitTest} 
                disabled={submitting} 
                variant="default"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang nộp...
                  </>
                ) : (
                  'Nộp bài'
                )}
              </Button>
            </div>
            
            <div className="space-y-8 mb-8">
              {questions.map((question, index) => (
                <div key={String(question.id)} className="border rounded-lg p-6">
                  <h3 className="font-medium mb-4">
                    <span className="font-bold">Câu {index + 1}:</span> {question.question}
                  </h3>
                  <div className="space-y-2 ml-6">
                    {question.options.map((option, optIndex) => (
                      <div 
                        key={optIndex}
                        className={`p-3 rounded border ${
                          selectedAnswers[String(question.id)] === optIndex
                            ? 'bg-primary/10 border-primary'
                            : 'bg-card hover:bg-muted/50 cursor-pointer'
                        }`}
                        onClick={() => handleAnswerSelect(question.id, optIndex)}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={handleSubmitTest} 
                disabled={submitting} 
                size="lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang nộp...
                  </>
                ) : (
                  'Nộp bài'
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CourseTestPage;
