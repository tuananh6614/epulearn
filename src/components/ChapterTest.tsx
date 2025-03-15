import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { AlertCircle, CheckCircle, XCircle, Trophy, RotateCcw } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/context/AuthContext';
import { fetchTestQuestions } from '@/integrations/supabase/testServices';

export interface TestQuestion {
  id: string;
  question: string;
  options: string[];
  answer: number;
}

export interface ChapterTestProps {
  questions?: TestQuestion[];
  onComplete: (score: number, total: number) => void;
  chapterId: string;
  courseId: string;
  lessonId?: string;
}

const ChapterTest: React.FC<ChapterTestProps> = ({ 
  questions: initialQuestions, 
  onComplete, 
  chapterId,
  courseId,
  lessonId 
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [testCompleted, setTestCompleted] = useState(false);
  const [highestScore, setHighestScore] = useState<number | null>(null);
  const [previousAttempts, setPreviousAttempts] = useState<number>(0);
  const [questions, setQuestions] = useState<TestQuestion[]>(initialQuestions || []);
  const [loading, setLoading] = useState(!initialQuestions);
  const { user } = useAuth();

  useEffect(() => {
    const loadQuestions = async () => {
      if (initialQuestions && initialQuestions.length > 0) {
        setQuestions(initialQuestions);
        return;
      }
      
      if (!chapterId) return;
      
      try {
        setLoading(true);
        const testQuestions = await fetchTestQuestions(chapterId);
        setQuestions(testQuestions);
      } catch (error) {
        console.error('Error loading test questions:', error);
        toast.error('Không thể tải câu hỏi kiểm tra');
      } finally {
        setLoading(false);
      }
    };
    
    loadQuestions();
  }, [chapterId, initialQuestions]);

  useEffect(() => {
    const fetchTestHistory = async () => {
      if (!user || !chapterId) return;
      
      try {
        // Get highest score for this test
        const { data, error } = await supabase
          .from('user_test_results')
          .select('score')
          .eq('user_id', user.id)
          .eq('chapter_id', chapterId)
          .order('score', { ascending: false })
          .limit(1);
          
        if (error) {
          console.error('Error fetching test history:', error);
        } else if (data && data.length > 0) {
          setHighestScore(data[0].score);
        }
        
        // Get attempt count
        const { count, error: countError } = await supabase
          .from('user_test_results')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('chapter_id', chapterId);
          
        if (countError) {
          console.error('Error fetching test attempts count:', countError);
        } else if (count !== null) {
          setPreviousAttempts(count);
        }
      } catch (err) {
        console.error('Error fetching test history:', err);
      }
    };
    
    fetchTestHistory();
  }, [user, chapterId]);

  const handleSelectAnswer = (value: string) => {
    setSelectedAnswer(parseInt(value));
  };
  
  const handleNextQuestion = () => {
    const currentQ = questions[currentQuestion];
    const isAnswerCorrect = selectedAnswer === currentQ.answer;
    
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
        
        if (onComplete) {
          // Calculate final score after the last question
          const finalScore = score + (isAnswerCorrect ? 1 : 0);
          onComplete(finalScore, questions.length);
        }
      }
    }, 1500);
  };
  
  const restartTest = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setTestCompleted(false);
  };
  
  if (loading) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Đang tải bài kiểm tra...</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full"></div>
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
    
    // Determine if this is a new high score
    const isNewHighScore = highestScore === null || percentageScore > highestScore;
    if (isNewHighScore) {
      setHighestScore(percentageScore);
    }
    
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
          
          {previousAttempts > 0 && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Trophy className="h-5 w-5 text-amber-500 mr-2" />
                <span className="font-medium">Điểm cao nhất của bạn: {highestScore}%</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {isNewHighScore 
                  ? "Chúc mừng! Đây là điểm cao nhất của bạn cho bài kiểm tra này."
                  : `Điểm lần này của bạn: ${percentageScore}% (Điểm cao nhất: ${highestScore}%)`}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Số lần làm bài: {previousAttempts + 1}
              </div>
            </div>
          )}
          
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
          <Button variant="outline" onClick={restartTest}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Làm lại bài kiểm tra
          </Button>
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
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium">
              Điểm: {score}/{currentQuestion}
            </span>
            
            {highestScore !== null && (
              <div className="flex items-center">
                <Trophy className="h-4 w-4 text-amber-500 mr-1" />
                <span className="text-sm font-medium">Cao nhất: {highestScore}%</span>
              </div>
            )}
          </div>
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
                  ? index === currentQ.answer 
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
                  showResult && index === currentQ.answer
                    ? "text-green-500 border-green-500"
                    : showResult && selectedAnswer === index && selectedAnswer !== currentQ.answer
                    ? "text-red-500 border-red-500"
                    : ""
                }
              />
              <Label htmlFor={`option-${index}`} className="flex-grow cursor-pointer">
                {option}
              </Label>
              {showResult && index === currentQ.answer && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              {showResult && selectedAnswer === index && selectedAnswer !== currentQ.answer && (
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
                : `Đáp án đúng là: ${currentQ.options[currentQ.answer]}`}
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
