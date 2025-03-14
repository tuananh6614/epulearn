
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Check, Timer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { fetchTestQuestions, saveTestResult } from '@/integrations/supabase/testServices';
import { useNavigate } from 'react-router-dom';

interface ChapterTestProps {
  chapterId: string;
  courseId: string;
  onComplete?: (score: number, passed: boolean) => void;
}

const ChapterTest: React.FC<ChapterTestProps> = ({ chapterId, courseId, onComplete }) => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const questionsData = await fetchTestQuestions(chapterId);
        if (questionsData.length > 0) {
          setQuestions(questionsData);
          // Set time based on question count (30 seconds per question)
          setTimeRemaining(Math.max(300, questionsData.length * 30));
        } else {
          toast({
            title: "Không tìm thấy câu hỏi",
            description: "Không có câu hỏi cho bài kiểm tra này.",
            variant: "destructive",
          });
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading test questions:', error);
        toast({
          title: "Lỗi khi tải bài kiểm tra",
          description: "Đã xảy ra lỗi khi tải bài kiểm tra. Vui lòng thử lại sau.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    if (chapterId) {
      loadQuestions();
    }
  }, [chapterId, toast]);

  // Timer countdown
  useEffect(() => {
    if (!completed && !loading && questions.length > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            submitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [completed, loading, questions]);

  const handleAnswer = (questionId: string, answerIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const submitTest = async () => {
    // Calculate score
    let correctCount = 0;
    let totalPoints = 0;

    questions.forEach(question => {
      const selectedAnswer = answers[question.id];
      // Convert correct_answer to number if it's a string
      const correctAnswer = typeof question.correct_answer === 'string' 
        ? parseInt(question.correct_answer, 10) 
        : question.correct_answer;
        
      if (selectedAnswer === correctAnswer) {
        correctCount++;
        totalPoints += question.points || 1;
      }
    });

    // Calculate percentage score
    const totalMaxPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0);
    const scorePercent = Math.round((totalPoints / totalMaxPoints) * 100);
    
    // Determine if passed (70% threshold)
    const passed = scorePercent >= 70;
    
    setScore(scorePercent);
    setCompleted(true);

    // Save result if user is logged in
    if (user?.id) {
      try {
        await saveTestResult(
          user.id, 
          courseId,
          chapterId, // Using chapterId as the test ID for chapter tests
          scorePercent,
          passed,
          300 - timeRemaining, // Time taken
          answers
        );
        
        toast({
          title: passed ? "Chúc mừng!" : "Hoàn thành bài kiểm tra",
          description: passed 
            ? `Bạn đã đạt ${scorePercent}% và vượt qua bài kiểm tra.` 
            : `Bạn đạt ${scorePercent}%. Hãy xem lại và thử lại.`,
          variant: passed ? "default" : "destructive",
        });
      } catch (error) {
        console.error('Error saving test result:', error);
      }
    }

    // Callback if provided
    if (onComplete) {
      onComplete(scorePercent, passed);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardContent className="p-6">
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Không có câu hỏi cho bài kiểm tra này.</p>
        </CardContent>
      </Card>
    );
  }

  if (completed) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl font-bold">Kết quả bài kiểm tra</CardTitle>
          <CardDescription>
            {score >= 70 
              ? "Chúc mừng, bạn đã vượt qua bài kiểm tra!" 
              : "Bạn cần học lại và thử lại bài kiểm tra."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center justify-center p-6 space-y-4">
            <div className={`text-5xl font-bold ${score >= 70 ? 'text-green-500' : 'text-red-500'}`}>
              {score}%
            </div>
            <p className="text-muted-foreground text-center">
              {score >= 70 
                ? "Bạn đã trả lời đúng đủ câu hỏi để vượt qua bài kiểm tra." 
                : "Bạn cần đạt ít nhất 70% để vượt qua bài kiểm tra."}
            </p>
          </div>
          
          {/* Summary of answers */}
          <div className="space-y-3 mt-6">
            <h3 className="font-semibold">Tóm tắt câu trả lời:</h3>
            {questions.map((question, index) => {
              const isCorrect = answers[question.id] === (
                typeof question.correct_answer === 'string' 
                  ? parseInt(question.correct_answer, 10) 
                  : question.correct_answer
              );
              return (
                <div key={question.id} className="flex items-start gap-2">
                  {isCorrect ? (
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                  ) : (
                    <div className="h-5 w-5 text-red-500 flex items-center justify-center mt-0.5">✕</div>
                  )}
                  <div>
                    <p className="font-medium">{index + 1}. {question.question}</p>
                    <p className="text-sm text-muted-foreground">
                      {isCorrect 
                        ? "Câu trả lời đúng" 
                        : `Câu trả lời đúng: ${question.options?.[typeof question.correct_answer === 'string' 
                            ? parseInt(question.correct_answer, 10) 
                            : question.correct_answer]}`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => {
              setAnswers({});
              setCompleted(false);
              setCurrentQuestion(0);
              setTimeRemaining(Math.max(300, questions.length * 30));
            }}
          >
            Làm lại
          </Button>
          <Button onClick={() => navigate(`/course/${courseId}`)}>
            Quay lại khóa học
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const currentQuestionData = questions[currentQuestion];

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle>Câu hỏi {currentQuestion + 1}/{questions.length}</CardTitle>
          <div className="flex items-center gap-1">
            <Timer className="h-4 w-4" />
            <span className={timeRemaining < 60 ? 'text-red-500 font-bold' : ''}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>
        <div className="w-full bg-gray-200 h-2 rounded-full mt-2">
          <div 
            className="bg-primary h-2 rounded-full" 
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </CardHeader>
      <CardContent className="pt-3">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">{currentQuestionData.question}</h3>
          </div>
          
          <RadioGroup 
            value={answers[currentQuestionData.id]?.toString() || ""} 
            onValueChange={(value) => handleAnswer(currentQuestionData.id, parseInt(value, 10))}
          >
            {currentQuestionData.options?.map((option: string, index: number) => (
              <div key={index} className="flex items-center space-x-2 p-3 rounded-md hover:bg-muted">
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-grow cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
          disabled={currentQuestion === 0}
        >
          Câu trước
        </Button>
        
        {currentQuestion < questions.length - 1 ? (
          <Button
            onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
          >
            Câu tiếp theo
          </Button>
        ) : (
          <Button onClick={submitTest}>
            Nộp bài
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ChapterTest;
