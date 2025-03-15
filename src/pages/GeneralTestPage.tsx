import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, FileText, CheckCircle, AlertCircle, Trophy, BarChart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchCourseTests } from '@/integrations/supabase/testServices';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface GeneralTestPageProps {}

const GeneralTestPage: React.FC<GeneralTestPageProps> = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [testStarted, setTestStarted] = useState(false);
  const [courseTest, setCourseTest] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [testCompleted, setTestCompleted] = useState(false);
  const [testResults, setTestResults] = useState<{
    score: number;
    totalQuestions: number;
    percentage: number;
    passed: boolean;
    previousAttempts: any[];
  }>({
    score: 0,
    totalQuestions: 0,
    percentage: 0,
    passed: false,
    previousAttempts: [],
  });
  
  useEffect(() => {
    if (!courseId) {
      toast.error("Không tìm thấy thông tin khóa học");
      navigate('/courses');
      return;
    }
    
    const loadCourseTest = async () => {
      try {
        setLoading(true);
        
        const testData = await fetchCourseTests(courseId);
        
        if (!testData) {
          toast.error("Không tìm thấy bài kiểm tra cho khóa học này");
          navigate(`/course/${courseId}`);
          return;
        }
        
        setCourseTest(testData.test);
        setQuestions(testData.questions);
        setTimeRemaining(testData.test.time_limit * 60);
        
        if (user) {
          const { data: previousTests, error } = await supabase
            .from('user_test_results')
            .select('*')
            .eq('user_id', user.id)
            .eq('course_id', courseId)
            .order('created_at', { ascending: false });
            
          if (!error && previousTests) {
            setTestResults(prev => ({
              ...prev,
              previousAttempts: previousTests
            }));
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading course test:', error);
        toast.error("Không thể tải bài kiểm tra");
        setLoading(false);
      }
    };
    
    loadCourseTest();
  }, [courseId, navigate, user]);
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (testStarted && !testCompleted && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            submitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [testStarted, testCompleted, timeRemaining]);
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  const startTest = () => {
    setTestStarted(true);
  };
  
  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };
  
  const submitTest = async () => {
    if (!courseId || !user) {
      toast.error("Bạn cần đăng nhập để lưu kết quả kiểm tra");
      return;
    }
    
    let score = 0;
    const totalQuestions = questions.length;
    
    questions.forEach(question => {
      if (selectedAnswers[question.id] === question.correct_answer) {
        score += question.points || 1;
      }
    });
    
    const maxPossibleScore = questions.reduce((total, q) => total + (q.points || 1), 0);
    const percentage = Math.round((score / maxPossibleScore) * 100);
    const passed = percentage >= (courseTest.passing_score || 70);
    
    try {
      const timeTaken = (courseTest.time_limit * 60) - timeRemaining;
      
      const { error } = await supabase
        .from('user_test_results')
        .insert({
          user_id: user.id,
          course_id: courseId,
          course_test_id: courseTest.id,
          score: percentage,
          passed,
          time_taken: timeTaken,
          answers: selectedAnswers
        });
        
      if (error) {
        console.error('Error saving test result:', error);
        toast.error("Không thể lưu kết quả kiểm tra");
      } else {
        const { data: previousTests, error: fetchError } = await supabase
          .from('user_test_results')
          .select('*')
          .eq('user_id', user.id)
          .eq('course_id', courseId)
          .order('created_at', { ascending: false });
          
        if (!fetchError && previousTests) {
          setTestResults(prev => ({
            ...prev,
            previousAttempts: previousTests
          }));
        }
      }
    } catch (error) {
      console.error('Error in submit test:', error);
    }
    
    setTestResults({
      score,
      totalQuestions,
      percentage,
      passed,
      previousAttempts: testResults.previousAttempts
    });
    
    setTestCompleted(true);
  };
  
  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      if (window.confirm('Bạn có chắc muốn nộp bài kiểm tra?')) {
        submitTest();
      }
    }
  };
  
  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };
  
  const retakeTest = () => {
    setSelectedAnswers({});
    setCurrentQuestion(0);
    setTimeRemaining(courseTest.time_limit * 60);
    setTestCompleted(false);
    setTestStarted(true);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/course/${courseId}`)}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại khóa học
          </Button>
          <h1 className="text-3xl font-bold">Bài kiểm tra tổng quát</h1>
        </div>
        
        {!testStarted ? (
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">{courseTest.title}</CardTitle>
              <CardDescription>{courseTest.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-muted-foreground mr-2" />
                <span>Thời gian: {courseTest.time_limit} phút</span>
              </div>
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-muted-foreground mr-2" />
                <span>Số câu hỏi: {questions.length}</span>
              </div>
              <div className="flex items-center">
                <Trophy className="h-5 w-5 text-muted-foreground mr-2" />
                <span>Điểm đạt: {courseTest.passing_score || 70}%</span>
              </div>
              
              {testResults.previousAttempts.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <h3 className="text-lg font-medium mb-2">Lần kiểm tra gần đây</h3>
                    <div className="space-y-2">
                      {testResults.previousAttempts.slice(0, 3).map((attempt, index) => (
                        <div key={index} className="flex items-center justify-between bg-muted/50 p-3 rounded-md">
                          <div>
                            <div className="font-medium">
                              Lần {testResults.previousAttempts.length - index}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(attempt.created_at).toLocaleDateString('vi-VN')}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={attempt.passed ? "success" : "destructive"}>
                              {attempt.score}%
                            </Badge>
                            {attempt.passed ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Lưu ý</AlertTitle>
                <AlertDescription>
                  Đồng hồ sẽ bắt đầu đếm ngay khi bạn bắt đầu bài kiểm tra. Hãy đảm bảo bạn có đủ thời gian để hoàn thành.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter>
              <Button onClick={startTest} className="w-full">Bắt đầu bài kiểm tra</Button>
            </CardFooter>
          </Card>
        ) : testCompleted ? (
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Kết quả bài kiểm tra</CardTitle>
              <CardDescription>
                {testResults.passed 
                  ? "Chúc mừng! Bạn đã hoàn thành bài kiểm tra thành công." 
                  : "Bạn chưa đạt điểm tối thiểu. Hãy xem lại bài học và thử lại."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">
                  {testResults.percentage}%
                </div>
                <Badge 
                  variant={testResults.passed ? "default" : "destructive"}
                  className="text-lg px-3 py-1"
                >
                  {testResults.passed ? "Đạt" : "Chưa đạt"}
                </Badge>
              </div>
              
              <Progress 
                value={testResults.percentage} 
                className={`h-3 ${testResults.passed ? "bg-green-500" : "bg-red-500"}`}
              />
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-muted/50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold mb-1">{testResults.score}</div>
                  <div className="text-sm text-muted-foreground">Số câu đúng</div>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold mb-1">{testResults.totalQuestions}</div>
                  <div className="text-sm text-muted-foreground">Tổng số câu</div>
                </div>
              </div>
              
              {testResults.previousAttempts.length > 1 && (
                <div className="mt-6">
                  <h3 className="font-medium mb-2">Tiến độ của bạn</h3>
                  <div className="h-40 bg-muted/50 rounded-lg p-4 flex items-end justify-between">
                    {testResults.previousAttempts.slice(0, 5).reverse().map((attempt, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div 
                          className={`w-12 ${attempt.passed ? 'bg-green-500' : 'bg-red-500'}`}
                          style={{ height: `${attempt.score}%` }}
                        ></div>
                        <div className="text-xs mt-2">Lần {index + 1}</div>
                        <div className="text-xs font-medium">{attempt.score}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="outline" 
                className="w-full sm:w-auto"
                onClick={() => navigate(`/course/${courseId}`)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại khóa học
              </Button>
              <Button 
                className="w-full sm:w-auto"
                onClick={retakeTest}
              >
                Làm lại bài kiểm tra
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <div className="max-w-3xl mx-auto">
            <div className="bg-background sticky top-16 z-10 pb-4 pt-2">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <span className="font-medium">Câu {currentQuestion + 1}/{questions.length}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-muted-foreground mr-2" />
                  <span className={`font-medium ${timeRemaining < 60 ? 'text-red-500' : ''}`}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              </div>
              <Progress value={(currentQuestion + 1) / questions.length * 100} className="h-1" />
            </div>
            
            {questions[currentQuestion] && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-xl">{questions[currentQuestion].question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Array.isArray(questions[currentQuestion].options) && 
                     questions[currentQuestion].options.map((option: string, index: number) => (
                      <div 
                        key={index}
                        className={`p-4 rounded-md border-2 cursor-pointer transition-all ${
                          selectedAnswers[questions[currentQuestion].id] === index 
                            ? 'border-primary bg-primary/5' 
                            : 'border-muted-foreground/20 hover:border-muted-foreground/40'
                        }`}
                        onClick={() => handleAnswerSelect(questions[currentQuestion].id, index)}
                      >
                        <div className="flex items-start">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${
                            selectedAnswers[questions[currentQuestion].id] === index 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {String.fromCharCode(65 + index)}
                          </div>
                          <div>{option}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={prevQuestion}
                    disabled={currentQuestion === 0}
                  >
                    Câu trước
                  </Button>
                  
                  {currentQuestion < questions.length - 1 ? (
                    <Button 
                      onClick={nextQuestion}
                      disabled={!selectedAnswers[questions[currentQuestion]?.id]}
                    >
                      Câu tiếp theo
                    </Button>
                  ) : (
                    <Button 
                      onClick={submitTest}
                      disabled={!selectedAnswers[questions[currentQuestion]?.id]}
                    >
                      Nộp bài
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )}
            
            <div className="flex flex-wrap gap-2 justify-center">
              {questions.map((_, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className={`w-10 h-10 p-0 ${
                    currentQuestion === index 
                      ? 'bg-primary text-primary-foreground' 
                      : selectedAnswers[questions[index]?.id] !== undefined
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                      : ''
                  }`}
                  onClick={() => setCurrentQuestion(index)}
                >
                  {index + 1}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default GeneralTestPage;
