import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { 
  ChevronRight, 
  ChevronLeft, 
  Clock, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-react';
import { fetchTestQuestions, saveTestResult, getTestProgressChartData } from '@/integrations/supabase';
import { useAuth } from '@/context/AuthContext';

interface ChapterTestProps {
  lessonId: string;
  chapterId: string;
  courseId: string;
  courseName: string;
  onTestComplete: () => void;
}

interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
}

const ChapterTest: React.FC<ChapterTestProps> = ({ lessonId, chapterId, courseId, courseName, onTestComplete }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<{ [questionId: string]: string }>({});
  const [testCompleted, setTestCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes in seconds
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);
        const questionsData = await fetchTestQuestions(lessonId, chapterId);
        setQuestions(questionsData as Question[]);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching questions:", err);
        setError(err.message || "Failed to load questions.");
      } finally {
        setLoading(false);
      }
    };
    
    loadQuestions();
  }, [lessonId, chapterId]);
  
  useEffect(() => {
    if (timeRemaining > 0 && !testCompleted) {
      const timerId = setInterval(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearInterval(timerId);
    } else if (timeRemaining === 0 && !testCompleted) {
      handleSubmitTest();
    }
  }, [timeRemaining, testCompleted]);
  
  const handleAnswerSelect = (option: string) => {
    setSelectedAnswer(option);
  };
  
  const goToNextQuestion = () => {
    if (selectedAnswer) {
      setUserAnswers(prev => ({
        ...prev,
        [questions[currentQuestionIndex].id]: selectedAnswer
      }));
      setSelectedAnswer(null);
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
    } else {
      toast({
        title: "Vui lòng chọn một đáp án",
        description: "Bạn cần chọn một đáp án trước khi tiếp tục.",
        variant: "destructive",
      });
    }
  };
  
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(userAnswers[questions[currentQuestionIndex - 1].id] || null);
    }
  };
  
  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  const handleSubmitTest = async () => {
    if (!user) {
      toast({
        title: "Bạn cần đăng nhập",
        description: "Vui lòng đăng nhập để nộp bài kiểm tra.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    
    // Collect answers for the last question if not already collected
    if (selectedAnswer) {
      setUserAnswers(prev => ({
        ...prev,
        [questions[currentQuestionIndex].id]: selectedAnswer
      }));
    }
    
    // Calculate score
    let correctAnswersCount = 0;
    questions.forEach(question => {
      if (userAnswers[question.id] === question.correct_answer) {
        correctAnswersCount++;
      }
    });
    const calculatedScore = (correctAnswersCount / questions.length) * 100;
    setScore(calculatedScore);
    setTestCompleted(true);
    
    try {
      // Save test result to database
      if (user) {
        const testResult = await saveTestResult(
          user.id,
          courseId,
          lessonId,
          calculatedScore,
          calculatedScore >= 80, // Assuming 80% is the passing score
          userAnswers,
          600 - timeRemaining,
          'Chapter Test'
        );
        
        if (testResult) {
          toast({
            title: "Bài kiểm tra đã hoàn thành!",
            description: `Bạn đã đạt được ${calculatedScore.toFixed(2)}%.`,
          });
          onTestComplete();
        } else {
          toast({
            title: "Lỗi khi lưu kết quả",
            description: "Có lỗi xảy ra khi lưu kết quả bài kiểm tra của bạn.",
            variant: "destructive",
          });
        }
      }
    } catch (err) {
      console.error("Error saving test result:", err);
      toast({
        title: "Lỗi khi lưu kết quả",
        description: "Có lỗi xảy ra khi lưu kết quả bài kiểm tra của bạn.",
        variant: "destructive",
      });
    }
  };
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Đang tải bài kiểm tra...</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={0} />
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lỗi</CardTitle>
          <CardDescription>Không thể tải bài kiểm tra.</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertCircle className="h-4 w-4 mr-2" />
          {error}
        </CardContent>
      </Card>
    );
  }
  
  if (testCompleted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bài kiểm tra đã hoàn thành!</CardTitle>
          <CardDescription>Bạn đã hoàn thành bài kiểm tra chương này.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          {score >= 80 ? (
            <>
              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
              <h2 className="text-2xl font-semibold text-green-600">Chúc mừng! Bạn đã đạt bài kiểm tra.</h2>
              <p className="text-gray-500">Điểm số của bạn: {score.toFixed(2)}%</p>
            </>
          ) : (
            <>
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-2xl font-semibold text-red-600">Rất tiếc, bạn chưa đạt bài kiểm tra.</h2>
              <p className="text-gray-500">Điểm số của bạn: {score.toFixed(2)}%</p>
            </>
          )}
        </CardContent>
        <CardFooter className="justify-between">
          <Button onClick={onTestComplete}>
            Quay lại khóa học
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  const currentQuestion = questions[currentQuestionIndex];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bài kiểm tra chương</CardTitle>
        <CardDescription>
          Trả lời các câu hỏi dưới đây. Thời gian còn lại: {formatTime(timeRemaining)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-lg font-semibold">
            Câu {currentQuestionIndex + 1}/{questions.length}: {currentQuestion.question}
          </p>
        </div>
        <RadioGroup defaultValue={userAnswers[currentQuestion.id] || ''} onValueChange={handleAnswerSelect}>
          <div className="grid gap-2">
            {currentQuestion.options.map((option, index) => (
              <div className="flex items-center space-x-2" key={index}>
                <RadioGroupItem value={option} id={`q${currentQuestionIndex}-${index}`} />
                <Label htmlFor={`q${currentQuestionIndex}-${index}`}>{option}</Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="secondary" onClick={goToPreviousQuestion} disabled={currentQuestionIndex === 0}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Trước
        </Button>
        {currentQuestionIndex === questions.length - 1 ? (
          <Button onClick={handleSubmitTest}>
            Nộp bài
            <CheckCircle className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={goToNextQuestion} disabled={!selectedAnswer}>
            Tiếp theo
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ChapterTest;
