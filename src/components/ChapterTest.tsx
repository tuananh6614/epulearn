import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { supabase, fetchTestQuestions, saveTestResult } from "@/integrations/supabase/client";
import { useAuth } from '@/context/AuthContext';

interface TestQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
}

interface ChapterTestProps {
  chapterId: string;
  courseId: string;
  onComplete?: (score: number, total: number) => void;
}

const ChapterTest: React.FC<ChapterTestProps> = ({ chapterId, courseId, onComplete }) => {
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [testCompleted, setTestCompleted] = useState(false);
  const { user } = useAuth();

  React.useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        
        console.log('Fetching test questions for chapter:', chapterId);
        const data = await fetchTestQuestions(chapterId);
        console.log('Received test questions:', data);
        
        if (data && data.length > 0) {
          const transformedQuestions: TestQuestion[] = data.map(q => ({
            id: q.id,
            question: q.question,
            options: Array.isArray(q.options) ? q.options : JSON.parse(q.options as string),
            correct_answer: q.correct_answer
          }));
          
          console.log('Transformed questions:', transformedQuestions);
          setQuestions(transformedQuestions);
        } else {
          console.warn('No test questions found for chapter:', chapterId);
          toast.error("Không tìm thấy bài kiểm tra cho chương này");
        }
      } catch (error) {
        console.error("Error fetching test questions:", error);
        toast.error("Không thể tải bài kiểm tra. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQuestions();
  }, [chapterId]);
  
  const handleSelectAnswer = (value: string) => {
    setSelectedAnswer(parseInt(value));
  };
  
  const handleNextQuestion = () => {
    const currentQ = questions[currentQuestion];
    const isAnswerCorrect = selectedAnswer === currentQ.correct_answer;
    
    if (isAnswerCorrect) {
      setScore(prev => prev + 1);
    }
    
    setIsCorrect(isAnswerCorrect);
    setShowResult(true);
    
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setTestCompleted(true);
        
        if (user) {
          updateTestProgress();
        }
        
        if (onComplete) {
          onComplete(score + (isAnswerCorrect ? 1 : 0), questions.length);
        }
      }
    }, 1500);
  };
  
  const updateTestProgress = async () => {
    try {
      const finalScore = score + (isCorrect ? 1 : 0);
      
      if (user) {
        const { data: lessonData } = await supabase
          .from('lessons')
          .select('id')
          .eq('chapter_id', chapterId)
          .eq('type', 'test')
          .limit(1);
          
        if (lessonData && lessonData.length > 0) {
          const testLessonId = lessonData[0].id;
          
          await saveTestResult(
            user.id,
            courseId,
            chapterId,
            testLessonId,
            finalScore,
            questions.length
          );
        }
      }
    } catch (error) {
      console.error("Error updating test progress:", error);
    }
  };
  
  const restartTest = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setTestCompleted(false);
  };
  
  if (isLoading) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Đang tải bài kiểm tra...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (questions.length === 0) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Không có bài kiểm tra</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Hiện tại chưa có bài kiểm tra nào cho chương này. Vui lòng quay lại sau.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  if (testCompleted) {
    const finalScore = score;
    const percentageScore = Math.round((finalScore / questions.length) * 100);
    const isPassed = percentageScore >= 70;
    
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Kết quả bài kiểm tra</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            {isPassed ? (
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-2" />
            ) : (
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-2" />
            )}
            <h3 className="text-2xl font-bold">
              {isPassed ? "Chúc mừng! Bạn đã hoàn thành bài kiểm tra" : "Bạn cần ôn tập lại"}
            </h3>
            <p className="text-muted-foreground mt-2">
              {isPassed 
                ? "Bạn đã hiểu rõ nội dung của chương này" 
                : "Hãy xem lại nội dung của chương và thử lại"}
            </p>
          </div>
          
          <div className="py-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Số câu đúng:</span>
              <span className="font-bold">{finalScore}/{questions.length}</span>
            </div>
            <Progress value={percentageScore} className="h-3" />
            <div className="flex justify-end mt-1">
              <span className="text-sm font-medium">{percentageScore}%</span>
            </div>
          </div>
          
          <Alert variant={isPassed ? "default" : "destructive"}>
            {isPassed ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>
              {isPassed 
                ? "Bạn đã đạt điểm đậu. Bạn có thể tiếp tục với các bài học tiếp theo."
                : "Bạn chưa đạt điểm đậu. Hãy xem lại bài học và thử lại."}
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button variant="outline" onClick={restartTest}>Làm lại bài kiểm tra</Button>
          <Button variant="default">Tiếp tục học</Button>
        </CardFooter>
      </Card>
    );
  }
  
  const currentQ = questions[currentQuestion];
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            Câu hỏi {currentQuestion + 1}/{questions.length}
          </span>
          <span className="text-sm font-medium">
            Điểm: {score}/{currentQuestion}
          </span>
        </div>
        <Progress 
          value={((currentQuestion + 1) / questions.length) * 100} 
          className="h-1 mb-4" 
        />
        <CardTitle className="text-lg">{currentQ.question}</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup 
          value={selectedAnswer !== null ? selectedAnswer.toString() : ""} 
          onValueChange={handleSelectAnswer}
          className="space-y-3"
          disabled={showResult}
        >
          {currentQ.options.map((option, index) => (
            <div 
              key={index} 
              className={`flex items-center space-x-2 p-3 rounded-md border ${
                showResult 
                  ? index === currentQ.correct_answer 
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20" 
                    : selectedAnswer === index 
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                      : "border-gray-200 dark:border-gray-700"
                  : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/60"
              }`}
            >
              <RadioGroupItem 
                value={index.toString()} 
                id={`option-${index}`} 
                className={
                  showResult && index === currentQ.correct_answer
                    ? "text-green-500 border-green-500"
                    : showResult && selectedAnswer === index && selectedAnswer !== currentQ.correct_answer
                    ? "text-red-500 border-red-500"
                    : ""
                }
              />
              <Label htmlFor={`option-${index}`} className="flex-grow cursor-pointer">
                {option}
              </Label>
              {showResult && index === currentQ.correct_answer && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              {showResult && selectedAnswer === index && selectedAnswer !== currentQ.correct_answer && (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
          ))}
        </RadioGroup>
        
        {showResult && (
          <div className={`mt-4 p-3 rounded-md ${
            isCorrect ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300" : 
            "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300"
          }`}>
            <p className="font-medium">
              {isCorrect ? "Chính xác!" : "Chưa chính xác!"}
            </p>
            <p className="text-sm mt-1">
              {isCorrect 
                ? "Bạn đã trả lời đúng. Chuyển sang câu tiếp theo..." 
                : `Đáp án đúng là: ${currentQ.options[currentQ.correct_answer]}`}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-between">
        <div className="text-sm text-muted-foreground">
          {!showResult ? "Chọn một đáp án để tiếp tục" : isCorrect ? "+1 điểm" : "Không được điểm"}
        </div>
        <Button 
          onClick={handleNextQuestion} 
          disabled={selectedAnswer === null || showResult}
        >
          {currentQuestion < questions.length - 1 ? "Câu tiếp theo" : "Kết thúc bài kiểm tra"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ChapterTest;
